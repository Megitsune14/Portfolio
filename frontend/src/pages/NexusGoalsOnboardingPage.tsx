import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import type { z } from 'zod';
import { StatusSelect } from '../components/goals/StatusSelect';
import { btnPrimary, errorClass, inputClass, labelClass } from '../lib/goals/ui';
import { onboardingFormSchema } from '../lib/goals/schemas';
import type { Profile } from '../types/goals';
import { goalsApiRequest } from '../utils/nexus-goals-api';

type OnboardingForm = z.infer<typeof onboardingFormSchema>;

export default function NexusGoalsOnboardingPage() {
  const navigate = useNavigate();

  const profileQuery = useQuery({
    queryKey: ['nexus-goals-profile'],
    queryFn: () => goalsApiRequest<{ profile: Profile | null }>('/profile'),
  });

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      gender: 'Homme',
      heightCm: '',
      weightKg: '',
      targetWeightKg: '',
    },
  });

  const saveMut = useMutation({
    mutationFn: (body: {
      gender: OnboardingForm['gender'];
      heightCm: number;
      weightKg: number;
      targetWeightKg?: number;
    }) => goalsApiRequest('/profile', { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => navigate('/nexus/goals/dashboard', { replace: true }),
  });

  if (profileQuery.isLoading) {
    return (
      <div className="app-shell flex items-center justify-center px-4">
        <div className="surface-panel w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-(--primary)" />
        </div>
      </div>
    );
  }

  if (profileQuery.data?.profile) {
    return <Navigate to="/nexus/goals/dashboard" replace />;
  }

  const onSubmit = form.handleSubmit((data) => {
    const target = data.targetWeightKg?.trim();
    saveMut.mutate({
      gender: data.gender,
      heightCm: Number(data.heightCm.replace(',', '.')),
      weightKg: Number(data.weightKg.replace(',', '.')),
      targetWeightKg: target ? Number(target.replace(',', '.')) : undefined,
    });
  });

  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4 py-10">
      <div className="surface-panel w-full max-w-lg p-8">
        <p className="eyebrow mb-3">Goals</p>
        <h1 className="font-jp text-2xl font-bold text-foreground">Configuration du profil</h1>
        <p className="mt-2 mb-8 text-sm text-muted">
          Ces informations servent de référence pour le suivi du poids et la progression des objectifs.
        </p>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
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
              Poids actuel (kg)
            </label>
            <input id="weightKg" className={inputClass} {...form.register('weightKg')} placeholder="70" />
            {form.formState.errors.weightKg ? (
              <p className={errorClass}>{form.formState.errors.weightKg.message}</p>
            ) : null}
          </div>

          <div>
            <label className={labelClass} htmlFor="targetWeightKg">
              Poids cible global (kg, optionnel)
            </label>
            <input id="targetWeightKg" className={inputClass} {...form.register('targetWeightKg')} placeholder="—" />
            {form.formState.errors.targetWeightKg ? (
              <p className={errorClass}>{form.formState.errors.targetWeightKg.message}</p>
            ) : null}
          </div>

          <button type="submit" className={`${btnPrimary} w-full`} disabled={saveMut.isPending}>
            {saveMut.isPending ? 'Enregistrement…' : 'Continuer'}
          </button>
        </form>
      </div>
    </div>
  );
}
