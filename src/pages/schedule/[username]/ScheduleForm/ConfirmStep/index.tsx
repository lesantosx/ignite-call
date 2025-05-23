import dayjs from 'dayjs';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Text, TextArea, TextInput } from '@ignite-ui/react';
import { api } from '@/src/lib/axios';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { CalendarBlank, Clock } from 'phosphor-react';
import { ConfirmForm, FormActions, FormError, FormHeader } from './styles';

const confirmFormSchema = z.object({
  name: z.string()
    .min(3, { message: 'O nome precisa ter pelo menos 3 letras' }),
  email: z.string()
    .email({ message: 'Digite um e-mail válido' }),
  observations: z.string().nullable(),
})

type ConfirmFormData = z.infer<typeof confirmFormSchema>;

interface ConfirmStepProps {
  schedulingDate: Date;
  onCancelConfirmation: () => void;
}

export function ConfirmStep({ schedulingDate, onCancelConfirmation }: ConfirmStepProps) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm<ConfirmFormData>({
    resolver: zodResolver(confirmFormSchema),
  });

  const router = useRouter();
  const username = String(router.query.username);

  async function handleConfirmScheduling(data: ConfirmFormData) {
    const {
      name,
      email,
      observations,
    } = data;

    await api.post(`/users/${username}/schedule`, {
      name,
      email,
      observations,
      date: schedulingDate
    });

    onCancelConfirmation();
  }

  const describedDate = dayjs(schedulingDate).format('DD[ de ]MMMM[ de ]YYYY');
  const describedTime = dayjs(schedulingDate).format('HH:mm[h]');

  return (
    <ConfirmForm as="form" onSubmit={handleSubmit(handleConfirmScheduling)}>
      <FormHeader>
        <Text>
          <CalendarBlank />
          {describedDate}
        </Text>
        <Text>
          <Clock />
          {describedTime}
        </Text>
      </FormHeader>

      <label>
        <Text size="sm">Nome completo</Text>
        <TextInput
          placeholder="Seu nome"
          crossOrigin={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          {...register('name')}
        />
        {errors.name && (
          <FormError size="sm">
            {errors.name.message}
          </FormError>
        )}
      </label>
      <label>
        <Text size="sm">Endereço de e-mail</Text>
        <TextInput
          type="email"
          placeholder="Seu e-mail"
          crossOrigin={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          {...register('email')}
        />
        {errors.email && (
          <FormError size="sm">
            {errors.email.message}
          </FormError>
        )}
      </label>
      <label>
        <Text size="sm">Observações</Text>
        <TextArea {...register('observations')} />
      </label>

      <FormActions>
        <Button
          type="button"
          variant="tertiary"
          onClick={onCancelConfirmation}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Confirmar agendamento
        </Button>
      </FormActions>
    </ConfirmForm>
  )
}