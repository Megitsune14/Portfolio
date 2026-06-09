import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';
import { GoalsPageLayout } from '../components/goals/GoalsPageLayout';
import { StatusSelect } from '../components/goals/StatusSelect';
import { profileEditFormSchema } from '../lib/goals/schemas';
import { btnPrimary, errorClass, inputClass, labelClass } from '../lib/goals/ui';
import type { Profile } from '../types/goals';
import { goalsApiRequest } from '../utils/nexus-goals-api';

type ProfileForm = z.infer<typeof profileEditFormSchema>;

export default function NexusGoalsProfilePage() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const profileQuery = useQuery({
    queryKey: ['nexus-goals-profile'],
    queryFn: () => goalsApiRequest<{ profile: Profile | null }>('/profile'),
  });

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileEditFormSchema),
    defaultValues: {
      gender: 'Homme',
      heightCm: '',
      weightKg: '',
      targetWeightKg: '',
    },
  });

  useEffect(() => {
    const profile = profileQuery.data?.profile;
    if (!profile) return;

    form.reset({
      gender: profile.gender,
      heightCm: String(profile.heightCm),
      weightKg: String(profile.weightKg),
      targetWeightKg: profile.targetWeightKg != null ? String(profile.targetWeightKg) : '',
    });
  }, [profileQuery.data?.profile, form]);

  const saveMut = useMutation({
    mutationFn: (body: {
      gender: ProfileForm['gender'];
      heightCm: number;
      weightKg: number;
      targetWeightKg?: number;
    }) => goalsApiRequest('/profile', { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nexus-goals-profile'] });
      queryClient.invalidateQueries({ queryKey: ['nexus-goals-dashboard'] });
      setSaved(true);
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    setSaved(false);
    const target = data.targetWeightKg?.trim();
    saveMut.mutate({
      gender: data.gender,
      heightCm: Number(data.heightCm.replace(',', '.')),
      weightKg: Number(data.weightKg.replace(',', '.')),
      targetWeightKg: target ? Number(target.replace(',', '.')) : undefined,
    });
  });

  if (profileQuery.isLoading) {
    return (
      <GoalsPageLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-(--primary)" />
        </div>
      </GoalsPageLayout>
    );
  }

  if (profileQuery.isError || !profileQuery.data?.profile) {
    return (
      <GoalsPageLayout>
        <div className="surface-panel flex-1 p-6 text-foreground">
          Impossible de charger le profil.
        </div>
      </GoalsPageLayout>
    );
  }

  return (
    <GoalsPageLayout>
      <div className="surface-panel flex-1 p-6 sm:p-8">
        <p className="eyebrow mb-3">Goals</p>
        <h2 className="font-jp text-2xl font-bold text-foreground">Profil</h2>
        <p className="mt-2 mb-8 text-sm text-muted">
          Modifie ta taille, ton poids de référence et ton objectif global. Ces valeurs servent au calcul de l&apos;IMC
          et à la progression des objectifs liés au poids.
        </p>

        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="gender">
              Genre
            </label>
            <Controller
              name="gender"
              control={form.control}
              render={({ field }) => (
                <StatusSelect
                  id="gender"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: 'Homme', label: 'Homme' },
                    { value: 'Femme', label: 'Femme' },
                    { value: 'MTF', label: 'MTF' },
                    { value: 'FTM', label: 'FTM' },
                  ]}
                />
              )}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="heightCm">
              Taille (cm)
            </label>
            <input id="heightCm" className={inputClass} {...form.register('heightCm')} placeholder="175" />
            {form.formState.errors.heightCm ? (
              <p className={errorClass}>{form.formState.errors.heightCm.message}</p>
            ) : null}
          </div>

          <div>
            <label className={labelClass} htmlFor="weightKg">
              Poids de référence (kg)
            </label>
            <input id="weightKg" className={inputClass} {...form.register('weightKg')} placeholder="70" />
            {form.formState.errors.weightKg ? (
              <p className={errorClass}>{form.formState.errors.weightKg.message}</p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="targetWeightKg">
              Poids cible global (kg, optionnel)
            </label>
            <input id="targetWeightKg" className={inputClass} {...form.register('targetWeightKg')} placeholder="—" />
            {form.formState.errors.targetWeightKg ? (
              <p className={errorClass}>{form.formState.errors.targetWeightKg.message}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <button type="submit" className={btnPrimary} disabled={saveMut.isPending}>
              {saveMut.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            {saved ? <p className="text-sm text-(--primary)">Profil mis à jour.</p> : null}
            {saveMut.isError ? (
              <p className={errorClass}>{saveMut.error instanceof Error ? saveMut.error.message : 'Erreur'}</p>
            ) : null}
          </div>
        </form>
      </div>
    </GoalsPageLayout>
  );
}
