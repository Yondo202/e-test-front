import { TextInput, Textarea, Button, Checkbox, Label, CkEditor, AnimatedTabs, Drawer, Sortable, SortableDragHandle, SortableItem, Skeleton, DeleteContent } from '@/components/custom';
import { useForm, useFieldArray, Controller, type FieldArrayWithId, type UseFieldArrayAppend, type UseFormWatch, type Control, type UseFieldArrayUpdate } from 'react-hook-form';
import { IoCloseOutline } from 'react-icons/io5';
import { MdOutlineAdd } from 'react-icons/md';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { useEffect, useState } from 'react';
// import { IoWarningOutline } from 'react-icons/io5';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { GoDotFill } from 'react-icons/go';
import { type TQuestionTypes, type TInputTypeTab, type TInputType, fillerInputTypes, type TAnswers } from '.';
import { cn } from '@/lib/utils';
import { BsChatSquareText } from 'react-icons/bs';
import { type TObjectPettern, type TQTypesProps, InitialAnswer } from './Action';
import { BsPencil } from 'react-icons/bs';
import { GoTrash } from 'react-icons/go';
import { PiDotsSixVerticalBold } from 'react-icons/pi';
import TotolUi from './components/TotolUi';
import { type TAction, type TActionProps } from '@/lib/sharedTypes'; //type TActionProps
// type TQTypesInBackEnd = 'radio' | 'checkbox' | 'text';

const SelectTypes: TInputTypeTab[] = [
   { label: 'Нэг зөв хариулттай', key: 'select' },
   { label: 'Олон зөв хариулттай', key: 'multi_select' },
];

type TScoreInputProps = {
   idPrefix?: string;
   isLine?: boolean;
   className?: string;
   control: Control<TQuestionTypes>;
   // control: TControllerProps['control'];
   watch?: UseFormWatch<TQuestionTypes>;
};

const ScoreInput = ({ control, idPrefix, watch, isLine = false, className }: TScoreInputProps) => {
   return (
      <div className={cn('', className)}>
         <TextInput
            floatLabel={isLine}
            className="w-64 mb-0"
            name="score"
            disabled={watch?.('input_type') === 'multi_select'}
            control={control}
            // beforeAddon={<GoDotFill className="text-xs" />}
            rules={{ required: 'Хариултын оноо оруулах', min: { message: 'Оноо - 0 байх боломжгүй', value: 0.001 } }}
            label="Асуултанд авах оноо"
            placeholder="Оноо оруулах"
            type="number"
            idPrefix={idPrefix}
         />
         <TotolUi isLine={isLine} mainCount={watch?.()?.score ?? 0} additionalCount={watch?.('sub_questions')?.reduce((a, b) => a + b.score, 0) ?? 0} />
      </div>
   );
};

export const WithSelect = ({ control, watch, setValue, clearErrors, idPrefix }: TQTypesProps) => {
   const { fields, append, remove, move } = useFieldArray({ control, name: 'answers', rules: { required: 'Хариултаа оруулна уу' } });

   useEffect(() => {
      if (watch?.('input_type') === 'multi_select') {
         setValue(
            'score',
            watch()
               .answers?.map((item) => item.mark)
               .reduce((prev, curr) => prev + curr, 0)
         );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [JSON.stringify(watch?.('answers')), watch?.('input_type')]);

   // console.log(, "watch?.('sub_questions')?.reduce((a, b) => a + b.score, 0)")÷
   // const TotalValue;

   return (
      <div className={cn('wrapper p-7 pt-0 mb-4 relative', idPrefix ? `p-0 mb-4 border-none shadow-none` : ``)}>
         <Controller
            control={control}
            name="input_type"
            render={({ field }) => {
               return (
                  <AnimatedTabs
                     className="text-xs mb-8"
                     items={SelectTypes}
                     activeKey={field.value}
                     onChange={(value) => {
                        if (value === 'select') {
                           setValue(
                              'answers',
                              fields.map((item) => ({ ...item, is_correct: false, mark: 0 }))
                           );
                        }

                        setValue('score', 0);
                        field.onChange(value as TInputType);
                     }}
                  />
               );
            }}
         />
         <div className="pb-12 grid grid-cols-[1fr_auto] gap-8">
            <Textarea
               className="w-full min-h-[100px]"
               name="question"
               control={control}
               label="Асуулт оруулах"
               placeholder="Асуултаа дэлгэрэнгүй оруулах"
               rules={{ required: 'Асуулт оруулах' }}
               idPrefix={idPrefix}
            />
            <ScoreInput {...{ watch, control, idPrefix }} />
         </div>
         {/* <div className={cn('grid grid-cols-[1fr_1fr] gap-x-10 gap-y-6', watch?.()?.input_type === 'multi_select' && 'grid-cols-[1fr]')}> */}
         <Sortable
            value={fields}
            onMove={({ activeIndex, overIndex }) => move(activeIndex, overIndex)}
            overlay={
               <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-sm" />
                  <Skeleton className="h-11 w-full rounded-sm" />
                  <Skeleton className="size-8 shrink-0 rounded-sm" />
                  {/* <Skeleton className="size-8 shrink-0 rounded-sm" /> */}
               </div>
            }
         >
            <div className={cn('grid grid-cols-1 gap-y-6')}>
               {fields?.map((item, index) => {
                  return (
                     <SortableItem key={item.id} value={item.id} asChild>
                        <div key={item.id} className={cn('grid grid-cols-[auto_1fr_auto] items-center gap-3', watch?.()?.input_type === 'multi_select' && `grid-cols-[auto_1fr_auto_auto]`)}>
                           <SortableDragHandle variant="ghost" size="icon" className="size-8 shrink-0">
                              <PiDotsSixVerticalBold className="text-lg text-muted-text" aria-hidden="true" />
                           </SortableDragHandle>
                           <div className="relative">
                              <TextInput
                                 control={control}
                                 name={`answers.${index}.answer`}
                                 rules={{ required: 'Хариултаа оруулна уу' }}
                                 sizes="lg"
                                 beforeAddon={<span className="font-light ml-1 text-base">{index + 1}.</span>}
                                 className="w-full"
                                 label="Хариулт оруулах"
                                 idPrefix={idPrefix}
                              />

                              <Controller
                                 control={control}
                                 name={`answers.${index}.is_correct` as const}
                                 render={({ field, fieldState }) => {
                                    return (
                                       <div className="flex items-center gap-3 px-4 absolute right-[1px] top-[1px] bottom-[1px] w-36 rounded-md bg-card-bg">
                                          <Checkbox
                                             name={field.name}
                                             id={`${idPrefix ?? ''}${field.name}`}
                                             checked={field.value}
                                             className={fieldState.error ? 'border-danger-color' : ''}
                                             onCheckedChange={(event) => {
                                                if (event) {
                                                   clearErrors?.('answers.0.is_correct');
                                                   clearErrors?.('answers.1.is_correct');
                                                }
                                                const newValue = watch?.()?.answers.map((element, ind) =>
                                                   ind === index
                                                      ? { ...element, mark: event ? element.mark : 0, is_correct: event ? true : false }
                                                      : watch()?.input_type === 'select'
                                                      ? { ...element, is_correct: false }
                                                      : element
                                                );
                                                setValue('answers', newValue ?? []);
                                             }}
                                          />
                                          <Label htmlFor={`${idPrefix ?? ''}${field.name}`} className={cn('m-0', fieldState.error ? `text-danger-color` : ``)}>
                                             Зөв хариулт
                                          </Label>
                                       </div>
                                    );
                                 }}
                              />
                           </div>

                           {watch?.()?.input_type === 'multi_select' ? (
                              <div className="w-48">
                                 {item.is_correct ? (
                                    <TextInput
                                       control={control}
                                       name={`answers.${index}.mark`}
                                       // rules={{ required: 'Хариултанд харгалзах оноо' }}
                                       rules={{ required: 'Хариултын оноо', min: { message: 'Оноо - 0 байх боломжгүй', value: 0.001 } }}
                                       sizes="lg"
                                       autoFocus
                                       beforeAddon={<GoDotFill className="text-xs" />}
                                       className="w-full"
                                       label="Харгалзах оноо"
                                       type="number"
                                       idPrefix={idPrefix}
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
                     </SortableItem>
                  );
               })}
            </div>
         </Sortable>

         <div className="py-6 pb-0 flex justify-center">
            <Button onClick={() => append(InitialAnswer)} variant="outline" size="sm" type="button" className="rounded-full ">
               <MdOutlineAdd className="text-base" /> Хариулт нэмэх
            </Button>
         </div>

         {/* {showError && (
            <div className="text-danger-color flex items-center gap-2 absolute right-4 -top-3 bg-card-bg px-4 py-1 rounded-md">
               <div className="relative">
                  <IoWarningOutline className="text-sm" />
                  <IoWarningOutline className="text-sm animate-ping absolute top-0 left-0" />
               </div>
               Зөв хариултаа сонгоно уу!
            </div>
         )} */}
      </div>
   );
};

const SelectInputTypes: TInputTypeTab[] = [
   { label: 'Богино хариулттай', key: 'text' },
   { label: 'Урт хариулттай', key: 'richtext' },
   { label: 'Дүрс зурагтай - асуулт / хариулт', key: 'essay' },
];

export const OpenQuestion = ({ control, watch, idPrefix }: TQTypesProps) => {
   return (
      <div className={cn('wrapper p-7 pt-0 mb-5', idPrefix ? `p-0 mb-4 border-none shadow-none` : ``)}>
         {/* <div className="pb-12 flex justify-between items-end"></div> */}
         <Controller
            control={control}
            name="input_type"
            render={({ field }) => {
               return (
                  <AnimatedTabs
                     className="mb-8 text-xs"
                     items={SelectInputTypes}
                     activeKey={field.value}
                     onChange={(value) => {
                        field.onChange(value as TInputType);
                     }}
                  />
               );
            }}
         />

         <ScoreInput {...{ watch, control, idPrefix }} className="flex items-center gap-0 mb-8" isLine />

         {watch?.()?.input_type === 'essay' ? (
            <>
               <Controller
                  control={control}
                  name="question"
                  rules={{ required: 'Асуулт оруулах' }}
                  render={({ field, fieldState }) => {
                     return (
                        <>
                           <Label htmlFor={field.name}>
                              Асуулт оруулах <span className="text-danger-color">*</span>
                           </Label>
                           <CkEditor value={field.value} setValue={(val) => field.onChange(val)} />
                           <ErrorMessage error={fieldState?.error} />
                        </>
                     );
                  }}
               />
            </>
         ) : (
            <Textarea
               className={cn('w-full transition-all', watch?.()?.input_type === 'richtext' ? `min-h-[220px]` : `min-h-[80px]`)}
               name="question"
               control={control}
               label="Асуулт оруулах"
               placeholder="Асуултаа дэлгэрэнгүй оруулах"
               rules={{ required: 'Асуулт оруулах' }}
               idPrefix={idPrefix}
            />
         )}
      </div>
   );
};

type fillerTypeEnum = keyof typeof fillerInputTypes;

// type TQuestionLine = {
//    value: string;
//    type: fillerTypeEnum;
// };

const fillerTabItem: TInputTypeTab[] = [
   { label: 'Хариулт харагдахгүй', key: 'filler' },
   { label: 'Хариултын сонголт харагдана', key: 'filler_with_choice' },
];

type TQuestionTypesInFront = { [Key in fillerTypeEnum]: Pick<TObjectPettern, 'label' | 'description' | 'icon'> };

const questionAsset: TQuestionTypesInFront = {
   question: {
      label: 'Асуулт хэсэг',
      description: 'Асуултын оролцогчид харагдах хэсэг',
      icon: BsChatSquareText,
   },
   answer: {
      label: 'Харуилт хэсэг',
      description: 'Шалгалтанд оролцогч нөхөж бичих хэсэг',
      icon: HiOutlineDotsHorizontal,
   },
};

// export const Filler = ({ idPrefix }: { title: string }) => {
export const Filler = ({ control, watch, idPrefix }: TQTypesProps) => {
   const [action, setAction] = useState<TAction<TAnswers>>({ isOpen: false, type: 'add', data: {} as TAnswers });
   const [subType, setSubType] = useState<{ temp_type: fillerTypeEnum; index: number }>({ temp_type: 'answer', index: 0 });
   const { fields, append, remove, update } = useFieldArray({ control, name: 'answers' });

   const setClose = () => {
      setAction((prev) => ({ ...prev, isOpen: false }));
   };

   const rowAction = (temp_type: fillerTypeEnum, type: TAction<TAnswers>['type'], data?: TAction<TAnswers>['data'], index?: number) => {
      setSubType({ temp_type: temp_type, index: index ?? 0 });
      setAction({ isOpen: true, type: type, data: data });
   };

   return (
      <>
         <div className={cn('wrapper p-7 pt-0 mb-5', idPrefix ? `p-0 mb-4 border-none shadow-none` : ``)}>
            <Controller
               control={control}
               name="input_type"
               render={({ field }) => {
                  return (
                     <AnimatedTabs
                        className="mb-8 text-xs"
                        items={fillerTabItem}
                        activeKey={field.value}
                        onChange={(value) => {
                           field.onChange(value as TInputType);
                        }}
                     />
                  );
               }}
            />

            <ScoreInput {...{ watch, control, idPrefix }} className="flex items-center gap-0 mb-8" isLine />

            <div className="flex gap-y-2 items-center flex-wrap">
               <div className="group flex gap-x-2 gap-y-2 items-center flex-wrap">
                  {fields.map((item, index) => {
                     return (
                        <div
                           key={item.id}
                           className={cn(
                              'relative group/items bg-card-bg group-hover:opacity-40 border cursor-pointer rounded-md leading-[2.3rem] border-transparent group-hover:hover:opacity-100 group-hover:hover:border-primary/20  max-w-full transition-all duration-500 py-1 px-2 ', //group-hover:hover:px-3
                              item.temp_type === 'answer' ? `text-primary` : ``
                              // item.value?.length > 50 ? `group-hover:hover:scale-120` : `group-hover:hover:scale-200`
                           )}
                        >
                           <div className="text-pretty">{item.answer}</div>

                           {/* daraa ActionButtons component iig ashigla */}
                           <div className="flex cursor-default items-center gap-2 absolute w-full -top-10 translate-y-1/2 -left-2 opacity-0 scale-0 transition-all duration-200 group-hover/items:opacity-100 group-hover/items:scale-100">
                              <Button
                                 onClick={() => rowAction(item.temp_type as fillerTypeEnum, 'edit', item, index)}
                                 variant="outline"
                                 className="rounded-full h-7 w-7 min-w-7"
                                 size="icon"
                                 type="button"
                              >
                                 <BsPencil className="text-xs2" />
                              </Button>
                              <Button
                                 onClick={() => rowAction(item.temp_type as fillerTypeEnum, 'delete', item, index)}
                                 variant="outline"
                                 className="rounded-full h-8 w-8 min-w-7"
                                 size="icon"
                                 type="button"
                              >
                                 <GoTrash className="text-sm" />
                              </Button>
                           </div>
                        </div>
                     );
                  })}
               </div>

               <Popover>
                  <PopoverTrigger asChild>
                     <Button className="rounded-full ml-2 bg-primary/10" variant="outline" size="icon" type="button">
                        <MdOutlineAdd className="text-lg" />
                     </Button>
                  </PopoverTrigger>

                  <PopoverContent className="p-6 w-78 flex flex-col gap-4" align="center" sideOffset={8}>
                     {Object.keys(questionAsset)?.map((item, index) => {
                        const Icon = questionAsset[item as fillerTypeEnum]?.icon;
                        return (
                           <div
                              // onClick={() => setQAction({ isOpen: true, type: item as fillerTypeEnum })}
                              onClick={() => rowAction(item as fillerTypeEnum, 'add', undefined, fields.length)}
                              className="group p-4 hover:bg-primary/5 rounded-md cursor-pointer grid grid-cols-[auto_1fr] gap-4 border border-primary/20"
                              key={index}
                           >
                              <Icon className="text-xl text-secondary mt-1" />

                              <div className="flex flex-col gap-1">
                                 <span className="font-medium">{questionAsset[item as fillerTypeEnum]?.label}</span>
                                 <span className="text-muted-text text-xs">{questionAsset[item as fillerTypeEnum]?.description}</span>
                              </div>
                           </div>
                        );
                     })}
                  </PopoverContent>
               </Popover>
            </div>

            <Drawer
               open={action.isOpen}
               onOpenChange={(event) => setAction((prev) => ({ ...prev, isOpen: event }))}
               title={questionAsset[subType.temp_type]?.label}
               content={
                  <FillerAnserAction
                     // onClose={() => setQAction({ isOpen: false, type: 'answer' })}
                     label={`${questionAsset[subType.temp_type]?.label} оруулах`}
                     temp_type={subType.temp_type}
                     {...{ append, fields, setClose, action, update }}
                     remove={() => remove(subType.index)}
                     indexKey={subType.index}
                  />
               }
               className={`py-2 max-w-2xl`}
            />
         </div>
      </>
   );
};

export type TFillerActionProps = {
   // type: TQuestion;
   append: UseFieldArrayAppend<TQuestionTypes, 'answers'>;
   remove: () => void;
   update: UseFieldArrayUpdate<TQuestionTypes, 'answers'>;
   indexKey: number;

   fields: FieldArrayWithId<TQuestionTypes, 'answers', 'id'>[];
   label: string;
   temp_type: fillerTypeEnum;
} & TActionProps<TAnswers>;

const FillerAnserAction = ({ temp_type, action, setClose, append, remove, update, indexKey, fields, label }: TFillerActionProps) => {
   const { control, handleSubmit, reset } = useForm<TAnswers>({
      defaultValues: { answer: '', temp_type: temp_type },
   });

   useEffect(() => {
      // if (action.type === 'add') {
      //    reset({ ...InitialonCreate({ type }) });
      //    return;
      // }

      if (action.type !== 'add') {
         reset(action.data);
      }
   }, [action.type, action.isOpen]);

   const onSubmit = (data: TAnswers) => {
      if (action.type === 'add') {
         append(data);
      }

      if (action.type === 'edit') {
         update(indexKey, data);
      }

      setClose?.({});
   };

   if (action.type === 'delete') {
      return <DeleteContent setClose={setClose} submitAction={() => (remove(), setClose?.({}))} />;
   }

   // edit deer active input iig haruulj medegd bas hooson ued haruul
   return (
      <form onSubmit={handleSubmit(onSubmit)} id="form-id" className="py-6">
         <div className="py-6 flex items-center gap-2 flex-wrap">
            {fields.map((item) => {
               return (
                  <div className="opacity-50" key={item.id}>
                     {item.answer}
                  </div>
               );
            })}
            <TextInput floatLabel={false} className="w-72" placeholder={label} control={control} name="answer" rules={{ required: label }} autoFocus />
         </div>

         <div className="flex mt-7 justify-end">
            <Button form="form-id" className="ml-auto" type="submit">
               Хадгалах
            </Button>
         </div>
      </form>
   );
};
