import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import type { z } from 'zod';
import { NexusPageHeader } from '@/components/nexus/NexusPageHeader';
import { NexusLoadingState } from '@/components/nexus/NexusStates';
import { StatusSelect } from '@/components/goals/StatusSelect';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { errorClass, labelClass } from '@/lib/goals/ui';
import { onboardingFormSchema } from '@/lib/goals/schemas';
import type { Profile } from '@/types/goals';
import { goalsApiRequest } from '@/utils/nexus-goals-api';

type OnboardingForm = z.infer<typeof onboardingFormSchema>;

export default function NexusGoalsOnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['nexus-goals-profile'] });
      navigate('/nexus/goals/dashboard', { replace: true });
    },
  });

  if (profileQuery.isLoading) {
    return (
      <>
        <NexusPageHeader title="Configuration Goals" />
        <NexusLoadingState />
      </>
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
    <>
      <NexusPageHeader
        title="Configuration Goals"
        description="Ces informations servent de référence pour le suivi du poids et la progression des objectifs."
      />

      <Card className="max-w-2xl">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
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
                Poids actuel (kg)
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
              <Input id="targetWeightKg" {...form.register('targetWeightKg')} placeholder="-" />
              {form.formState.errors.targetWeightKg ? (
                <p className={errorClass}>{form.formState.errors.targetWeightKg.message}</p>
              ) : null}
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" disabled={saveMut.isPending}>
                {saveMut.isPending ? 'Enregistrement…' : 'Continuer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
