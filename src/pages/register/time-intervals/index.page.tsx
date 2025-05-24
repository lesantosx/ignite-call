import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Checkbox,
  Heading,
  MultiStep,
  Text,
  TextInput
} from '@ignite-ui/react';
import { ArrowRight } from 'phosphor-react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Container, Header } from '../styles'; 
import {
  IntervalBox,
  IntervalDays,
  IntervalInputs,
  IntervalItem,
  IntervalsContainer,
  FormError
} from './styles';
import { getWeekDays } from '@/src/utils/get-week-days';
import { convertTimeStringToMinutes } from '@/src/utils/convert-time';
import { api } from '@/src/lib/axios';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';

const timeIntervalsFormSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),
      }),
    )
    .length(7)
    .refine((intervals) => intervals.some((interval) => interval.enabled), {
      message: 'Você precisa selecionar pelo menos um dia da semana!',
    })
    .refine((intervals) =>
      intervals.every((interval) => {
        if (!interval.enabled) return true;
        return (
          convertTimeStringToMinutes(interval.endTime) - 60 >=
          convertTimeStringToMinutes(interval.startTime)
        );
      }),
      {
        message: 'O horário de término deve ser pelo menos 1h distante do início.',
      }
    ),
});

type TimeIntervalsFormInput = z.input<typeof timeIntervalsFormSchema>;

type TimeIntervalsFormOutput = Array<{
  weekDay: number;
  startTimeInMinutes: number;
  endTimeInMinutes: number;
}>;

export default function TimeIntervals() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<TimeIntervalsFormInput>({
    resolver: zodResolver(timeIntervalsFormSchema),
    defaultValues: {
      intervals: [
        { weekDay: 0, enabled: false, startTime: '08:00', endTime: '18:00' },
        { weekDay: 1, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 2, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 3, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 4, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 5, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 6, enabled: false, startTime: '08:00', endTime: '18:00' },
      ]
    },
  });

  const router = useRouter();

  const weekDays = getWeekDays();

  const { fields } = useFieldArray({
    name: 'intervals',
    control,
  })

  const intervals = watch('intervals');

  async function handleSetTimeIntervals(data: TimeIntervalsFormInput) {
    const intervals = data.intervals
      .filter((interval) => interval.enabled)
      .map((interval) => ({
        weekDay: interval.weekDay,
        startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
        endTimeInMinutes: convertTimeStringToMinutes(interval.endTime),
      }));

    await api.post('/users/time-intervals', {
      intervals,
    });

    await router.push(`/register/update-profile`);
  }

  return (
    <>
      <NextSeo title="Selecione sua disponibilidade | Ignite Call" noindex />
      <Container>
        <Header>
          <Heading as="strong">
            Quase lá!
          </Heading>
          <Text>
            Defina o intervalo de horários que você está disponível em cada dia da semana.
          </Text>

          <MultiStep size={4} currentStep={3} />
        </Header>

        <IntervalBox as="form" onSubmit={handleSubmit(handleSetTimeIntervals)}>
          <IntervalsContainer>
            {fields.map((field, index) => {
              return (
                <IntervalItem key={field.id}>
                  <IntervalDays>
                    <Controller 
                      control={control}
                      name={`intervals.${index}.enabled`}
                      render={({ field }) => {
                        return (
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked === true);
                            }}
                          />
                        )
                      }}
                    />
                    <Text>{weekDays[field.weekDay]}</Text>
                  </IntervalDays>
                  <IntervalInputs>
                    <TextInput
                      size="sm"
                      type="time"
                      step={60}
                      crossOrigin={undefined}
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                      {...register(`intervals.${index}.startTime`)}
                      disabled={intervals[index].enabled === false}
                    />
                    <TextInput
                      size="sm"
                      type="time"
                      step={60}
                      crossOrigin={undefined}
                      onPointerEnterCapture={undefined}
                      onPointerLeaveCapture={undefined}
                      {...register(`intervals.${index}.endTime`)}
                      disabled={intervals[index].enabled === false}
                    />
                  </IntervalInputs>
                </IntervalItem>
              )
            })}          
          </IntervalsContainer>

          {errors.intervals && (
            <FormError size="sm">{errors.intervals.root?.message}</FormError> 
          )}

          <Button type="submit" disabled={isSubmitting}>
            Próximo passo
            <ArrowRight />
          </Button>
        </IntervalBox>
      </Container>
    </>
  )
}