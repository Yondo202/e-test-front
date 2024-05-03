import { TextInput, Textarea, Button, Checkbox, Label, CkEditor, Header, SelectInput, AnimatedTabs } from '@/components/custom';
import { useForm, type FieldValues, useFieldArray, Controller } from 'react-hook-form';
import { IoCloseOutline } from 'react-icons/io5';
import { MdOutlineAdd } from 'react-icons/md';
import { useMutation } from '@tanstack/react-query';
import { request } from '@/lib/core/request';
import { BsSave } from 'react-icons/bs';
import { useEffect, useState } from 'react';
import { IoWarningOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { TControllerProps } from '@/lib/sharedTypes';
import { useGetCategories, type TKeys } from '../category';
import { GoDotFill } from 'react-icons/go';
import { type TQuestionTypes, type TAnswers, type TInputTypeTab, type TInputType, type TQuestion } from '.';
import { cn } from '@/lib/utils';

// type TQTypesInBackEnd = 'radio' | 'checkbox' | 'text';

const CategorySelect = <TFieldValues extends FieldValues>({ control, name, current, label }: TControllerProps<TFieldValues> & { current: TKeys; label: string }) => {
   const { data } = useGetCategories({ current });
   return (
      <SelectInput options={data?.data ? data.data?.map((item) => ({ value: item.id, label: item.name })) : []} rules={{ required: 'Ангилалаа сонгоно уу' }} {...{ label, name, control }} />
   );
};

const InitialAnswer: TAnswers[] = [
   {
      answer: '',
      is_correct: false,
      sort_number: 0,
      mark: 0,
   },
   {
      answer: '',
      is_correct: false,
      sort_number: 1,
      mark: 0,
   },
];

const SelectTypes: TInputTypeTab[] = [
   { label: 'Нэг зөв хариулттай', key: 'select' },
   { label: 'Олон зөв хариулттай', key: 'multi_select' },
];

export const WithSelect = ({ title, type }: { title: string; type: TQuestion }) => {
   const navigate = useNavigate();
   const [showError, setShowError] = useState(false);
   const { control, handleSubmit, watch, setValue } = useForm<TQuestionTypes>({
      defaultValues: { question: '', score: 0, category_id: '', sub_category_id: '', input_type: 'select', answers: InitialAnswer },
   });
   const { fields, append, remove } = useFieldArray({ control, name: 'answers', rules: { required: 'Хариултаа оруулна уу' } });

   const { isPending, mutate } = useMutation({
      // mutationFn: (body?: Omit<TQuestionTypes, 'id'> | undefined) =>
      mutationFn: (body: TQuestionTypes) =>
         request<Omit<TQuestionTypes, 'id'>>({
            method: 'post',
            url: `exam/question-with-answers`,
            body: body,
         }),
      onSuccess: () => {
         navigate('/questions');
      },
   });

   const onSubmit = (data: TQuestionTypes) => {
      if (!watch()?.answers?.some((item) => item.is_correct)) {
         setShowError(true);
         return;
      }
      // input_type: 'select',
      // total_score: 20,
      mutate({ ...data, sort_number: 0, type: type, answers: data.answers.map((el, index) => ({ ...el, sort_number: index })) });
   };

   useEffect(() => {
      if (watch()?.input_type === 'multi_select') {
         setValue(
            'score',
            watch()
               .answers?.map((item) => item.mark)
               .reduce((prev, curr) => prev + curr, 0)
         );
      }
   }, [watch()]);

   return (
      <form onSubmit={handleSubmit(onSubmit)}>
         <Header
            title={title}
            action={
               <Button isLoading={isPending} type="submit">
                  <BsSave className="text-sm mr-1" />
                  Хадгалах
               </Button>
            }
         />

         <div className="wrapper p-7 mb-5">
            <div className="flex gap-10 mb-5">
               <CategorySelect control={control} name="category_id" current="main_category" label="Үндсэн ангилал" />
               <CategorySelect control={control} name="sub_category_id" current="sub_category" label="Дэд ангилал" />
            </div>

            <Textarea
               className="w-full min-h-[100px]"
               name="question"
               control={control}
               label="Асуулт оруулах"
               placeholder="Асуултаа дэлгэрэнгүй оруулах"
               rules={{ required: 'Асуулт оруулах' }}
            />
         </div>

         <div className={cn('wrapper p-7 relative', showError ? `border-danger-color` : ``)}>
            <div className="pb-12 flex justify-between items-end">
               <TextInput
                  // floatLabel={false}
                  className="w-72 mb-0"
                  name="score"
                  disabled={watch()?.input_type === 'multi_select'}
                  control={control}
                  beforeAddon={<GoDotFill className="text-xs" />}
                  rules={{ required: 'Хариултын оноо оруулах', min: { message: 'Хамгийн багадаа 1 оноо оруулах боломжтой', value: 1 } }}
                  label="Асуултанд авах оноо"
                  placeholder="Оноо оруулах"
                  type="number"
               />
               <Controller
                  control={control}
                  name="input_type"
                  render={({ field }) => {
                     return (
                        <AnimatedTabs
                           className="mb-0 -mt-2 text-xs"
                           items={SelectTypes}
                           activeKey={field.value}
                           onChange={(value) => {
                              if (value === 'select') {
                                 setValue(
                                    'answers',
                                    fields.map((item) => ({ ...item, is_correct: false, mark: 0 }))
                                 );
                              }

                              field.onChange(value as TInputType);
                           }}
                        />
                     );
                  }}
               />
            </div>
            <div className={cn('grid grid-cols-[1fr_1fr] gap-x-10 gap-y-6', watch()?.input_type === 'multi_select' && 'grid-cols-[1fr]')}>
               {fields?.map((item, index) => {
                  return (
                     <div key={item.id} className={cn('grid grid-cols-[1fr_auto] items-center gap-3', watch()?.input_type === 'multi_select' && `grid-cols-[1fr_auto_auto] gap-8`)}>
                        <div className="relative">
                           <TextInput
                              control={control}
                              name={`answers.${index}.answer`}
                              rules={{ required: 'Хариултаа оруулна уу' }}
                              sizes="lg"
                              beforeAddon={<span className="font-light ml-1 text-base">{index + 1}.</span>}
                              className="w-full"
                              label="Хариулт оруулах"
                           />

                           <Controller
                              control={control}
                              name={`answers.${index}.is_correct` as const}
                              render={({ field }) => {
                                 return (
                                    <div className="flex items-center gap-3 px-3 absolute right-[1px] top-[1px] bottom-[1px] w-36 rounded-md bg-card-bg">
                                       <Checkbox
                                          name={field.name}
                                          id={field.name}
                                          checked={field.value}
                                          onCheckedChange={(event) => {
                                             event ? setShowError(false) : null;
                                             const newValue = watch()?.answers.map((element, ind) =>
                                                ind === index
                                                   ? { ...element, mark: event ? element.mark : 0, is_correct: event ? true : false }
                                                   : watch()?.input_type === 'select'
                                                   ? { ...element, is_correct: false }
                                                   : element
                                             );
                                             setValue('answers', newValue);
                                          }}
                                       />
                                       <Label htmlFor={field.name} className="m-0">
                                          Зөв хариулт
                                       </Label>
                                    </div>
                                 );
                              }}
                           />
                        </div>

                        {watch()?.input_type === 'multi_select' ? (
                           <div className="w-80">
                              {item.is_correct ? (
                                 <TextInput
                                    control={control}
                                    name={`answers.${index}.mark`}
                                    // rules={{ required: 'Хариултанд харгалзах оноо' }}
                                    rules={{ required: 'Хариултын оноо оруулах', min: { message: 'Хамгийн багадаа 1 оноо оруулах боломжтой', value: 1 } }}
                                    sizes="lg"
                                    autoFocus
                                    beforeAddon={<GoDotFill className="text-xs" />}
                                    className="w-full"
                                    label="Зөв хариултанд харгалзах оноо"
                                    type="number"
                                 />
                              ) : (
                                 <span className="text-muted-text opacity-60">
                                    <span className="text-lg font-medium">0 / </span> оноо
                                 </span>
                              )}
                           </div>
                        ) : null}

                        <Button disabled={fields.length === 2} onClick={() => remove(index)} size="icon" variant="ghost" className="rounded-full" type="button">
                           <IoCloseOutline className="text-[22px] text-danger-color " />
                        </Button>
                     </div>
                  );
               })}
            </div>
            <div className="py-10 pb-0 flex justify-end">
               <Button onClick={() => append({ ...InitialAnswer[0], sort_number: fields.length })} variant="outline" type="button" className="rounded-md">
                  <MdOutlineAdd className="text-base" /> Хариулт нэмэх
               </Button>
            </div>

            {showError && (
               <div className="text-danger-color flex items-center gap-2 absolute right-4 -top-3 bg-card-bg px-4 py-1 rounded-md">
                  <div className="relative">
                     <IoWarningOutline className="text-sm" />
                     <IoWarningOutline className="text-sm animate-ping absolute top-0 left-0" />
                  </div>
                  Зөв хариултаа сонгоно уу!
               </div>
            )}
         </div>
      </form>
   );
};

export const OpenQuestion = () => {
   const { control } = useForm({ defaultValues: { question: '', score: '' } });
   return (
      <>
         <div className="wrapper p-7">
            <TextInput floatLabel={false} className="w-72 mb-5" name="score" control={control} label="Асуултын оноо" placeholder="Оноо оруулах" type="number" />
            <Textarea className="w-full min-h-[100px]" name="question" control={control} label="Асуулт оруулах" placeholder="Асуултаа дэлгэрэнгүй оруулах" />
         </div>
      </>
   );
};

export const WithMedia = () => {
   const { control } = useForm({ defaultValues: { question: '', score: '' } });
   return (
      <>
         <div className="wrapper p-7">
            <TextInput floatLabel={false} className="w-72 mb-5" name="score" control={control} label="Асуултын оноо" placeholder="Оноо оруулах" type="number" />
            <Label htmlFor="123">Асуулт оруулах</Label>
            <CkEditor />
         </div>
      </>
   );
};

export const WithAdditional = () => {
   const { control } = useForm({ defaultValues: { question: '', score: '' } });
   return (
      <>
         <div className="wrapper p-7">
            <TextInput floatLabel={false} className="w-72 mb-5" name="score" control={control} label="Асуултын оноо" placeholder="Оноо оруулах" type="number" />
            <Textarea className="w-full min-h-[100px]" name="question" control={control} label="Асуулт оруулах" placeholder="Асуултаа оруулах" />
            <div className="py-5 text-secondary/70">Нэмэлт асуулт</div>

            <div className="grid grid-cols-[1fr_1fr] gap-x-10 gap-y-6">
               <div className="grid grid-cols-[auto_1fr] items-center gap-2">
                  <Button size="icon" variant="ghost" className="rounded-full">
                     <IoCloseOutline className="text-[22px] text-danger-color " />
                  </Button>
                  <TextInput sizes="lg" beforeAddon={<span className="font-light ml-1 text-base">1.</span>} className="w-full" name="question" control={control} label="Асуулт оруулах" />
               </div>
            </div>
            <div className="py-8 pb-0 flex justify-end">
               <Button variant="outline" className="rounded-md">
                  <MdOutlineAdd className="text-base" /> Нэмэлт асуулт нэмэх
               </Button>
            </div>
         </div>
      </>
   );
};
