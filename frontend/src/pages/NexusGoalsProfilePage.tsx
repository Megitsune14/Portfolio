import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';
import { NexusPageHeader } from '@/components/nexus/NexusPageHeader';
import { NexusErrorState, NexusLoadingState } from '@/components/nexus/NexusStates';
import { StatusSelect } from '@/components/goals/StatusSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { profileEditFormSchema } from '@/lib/goals/schemas';
import { errorClass, labelClass } from '@/lib/goals/ui';
import type { Profile } from '@/types/goals';
import { goalsApiRequest } from '@/utils/nexus-goals-api';

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
      <>
        <NexusPageHeader title="Profil Goals" />
        <NexusLoadingState />
      </>
    );
  }

  if (profileQuery.isError || !profileQuery.data?.profile) {
    return (
      <>
        <NexusPageHeader title="Profil Goals" />
        <NexusErrorState message="Impossible de charger le profil." />
      </>
    );
  }

  return (
    <>
      <NexusPageHeader
        title="Profil Goals"
        description="Taille, poids de référence et objectif global pour le calcul de l'IMC et la progression."
      />

      <Card className="max-w-2xl">
        <form onSubmit={onSubmit}>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
            <div className="sm:col-span-2">
              <Label className={labelClass} htmlFor="gender">
                Genre
              </Label>
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
              <Label className={labelClass} htmlFor="heightCm">
                Taille (cm)
              </Label>
              <Input id="heightCm" {...form.register('heightCm')} placeholder="175" />
              {form.formState.errors.heightCm ? (
                <p className={errorClass}>{form.formState.errors.heightCm.message}</p>
              ) : null}
            </div>

            <div>
              <Label className={labelClass} htmlFor="weightKg">
                Poids de référence (kg)
              </Label>
              <Input id="weightKg" {...form.register('weightKg')} placeholder="70" />
              {form.formState.errors.weightKg ? (
                <p className={errorClass}>{form.formState.errors.weightKg.message}</p>
              ) : null}
            </div>

            <div className="sm:col-span-2">
              <Label className={labelClass} htmlFor="targetWeightKg">
                Poids cible global (kg, optionnel)
              </Label>
              <Input id="targetWeightKg" {...form.register('targetWeightKg')} placeholder="—" />
              {form.formState.errors.targetWeightKg ? (
                <p className={errorClass}>{form.formState.errors.targetWeightKg.message}</p>
              ) : null}
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center gap-4 border-t border-border px-6 py-4 sm:px-8">
            <Button type="submit" disabled={saveMut.isPending}>
              {saveMut.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
            {saved ? <p className="text-sm text-primary">Profil mis à jour.</p> : null}
            {saveMut.isError ? (
              <p className={errorClass}>
                {saveMut.error instanceof Error ? saveMut.error.message : 'Erreur'}
              </p>
            ) : null}
          </CardFooter>
        </form>
      </Card>
    </>
  );
}
