import { BreadCrumb, SelectInput, Header, Button, UsePrompt, Dialog, DeleteContent, Skeleton } from '@/components/custom';
import { useEffect, useMemo, useState } from 'react';
import { MdOutlineAdd } from 'react-icons/md';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { TBreadCrumb } from '@/components/custom/BreadCrumb';
import { useGetCategories, type TKeys } from '../category';
import {
   type FieldValues,
   useForm,
   type Control,
   type UseFormWatch,
   type UseFormSetValue,
   useFieldArray,
   type UseFieldArrayAppend,
   type UseFieldArrayUpdate,
   type UseFormClearErrors,
} from 'react-hook-form'; //useFieldArray
import { useMutation, useQuery } from '@tanstack/react-query';
import { TControllerProps, type TAction, type TActionProps } from '@/lib/sharedTypes'; //type TActionProps
// import { TControllerProps } from '@/lib/sharedTypes';
import { WithSelect, OpenQuestion, Filler } from './QuestionTypes'; // Filler -- daraa nemchine
import { type TQuestion, type TQuestionTypes, type TAnswers, type TInputType, SelectQuestionType, type AllTypesQuestionTypes } from '.';
import { IconType } from 'react-icons/lib';
import { GoCheckCircle } from 'react-icons/go';
import { BsSave } from 'react-icons/bs';
import { IoTextOutline } from 'react-icons/io5';
import { request } from '@/lib/core/request';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { cn } from '@/lib/utils';
import ActionButtons from '@/components/ActionButtons';

// eslint-disable-next-line react-refresh/only-export-components
// [ multi_select, select, text, drag_drop, multi_drag_drop ] - essay hassan
// export type TQTypes = 'withSelect' | 'openQuestion'; // | 'fill';
// | 'withAdditional';

type AdditionalProps = {
   clearErrors?: UseFormClearErrors<TQuestionTypes>;
};

export type TQTypesProps = {
   control: Control<TQuestionTypes>;
   // control: TControllerProps['control'];
   watch?: UseFormWatch<TQuestionTypes>;
   setValue: UseFormSetValue<TQuestionTypes>;
   idPrefix?: string;
   // sumName?: TControllerProps['name'];
} & AdditionalProps;

export type TObjectPettern = {
   label: string;
   component: ({ control, watch, setValue }: TQTypesProps) => JSX.Element;
   // type: TQuestion;
   description: string;
   icon: IconType;

   input_type: TInputType;
   // 'multi_select' | 'select' | 'text' | 'richtext' | 'text_format' | 'filler' | 'filler_with_choice';
};

type TQuestionTypesInFront = { [Key in TQuestion]: TObjectPettern };

// eslint-disable-next-line react-refresh/only-export-components
export const questionAsset: TQuestionTypesInFront = {
   checkbox: {
      label: 'Сонголттой асуулт',
      component: WithSelect,
      // type: 'checkbox',
      description: 'Нэг болон олон сонголттой тест',
      icon: GoCheckCircle,
      input_type: 'select', // default type
   },
   text: {
      label: 'Нээлттэй асуулт',
      component: OpenQuestion,
      // type: 'text',
      description: 'Энгийн болон Эссэ бичих боломжтой',
      icon: IoTextOutline,
      input_type: 'text', // default type
   },
   fill: {
      label: 'Нөхөж бичих',
      component: Filler,
      // type: 'text', // filler gedeg typetai bolno
      description: 'Өгүүлбэр дунд хариулт нөхөж оруулах боломжтой',
      icon: HiOutlineDotsHorizontal,
      input_type: 'filler', // default type
   },
};

const errorText = 'Зөв хариултаа сонгоно уу!';

type TSelectProps = { current: TKeys; label: string; disabled?: boolean; idKey?: string; onChange?: (name: string) => void };

export const CategorySelect = <TFieldValues extends FieldValues>({ control, name, current, label, disabled, idKey, onChange }: TControllerProps<TFieldValues> & TSelectProps) => {
   const { data, isLoading } = useGetCategories({ current, idKey });
   return isLoading ? (
      <Skeleton className="h-12 w-full" />
   ) : (
      <SelectInput
         disabled={disabled}
         options={data?.data ? data.data?.map((item) => ({ value: item.id, label: item.name })) : []}
         rules={{ required: 'Ангилалаа сонгоно уу' }}
         {...{ label, name, control, onChange }}
      />
   );
};

// export type TQTypes = keyof typeof qTypes;

const GroupAction = ({ breadcrumbs }: { breadcrumbs: TBreadCrumb[] }) => {
   const [search] = useSearchParams({});
   const searchAsObject = Object.fromEntries(new URLSearchParams(search));

   return (
      <>
         <BreadCrumb pathList={[...breadcrumbs.map((item) => ({ ...item, isActive: false })), { to: '#', label: 'Тестийн сан үүсгэх', isActive: true }]} />
         {/* <Component title={questionAsset[searchAsObject.type as TQTypes]?.label} type={questionAsset[searchAsObject.type as TQTypes]?.type} /> */}
         <ActionWrapper type={searchAsObject.type as TQuestion} />
      </>
   );
};

export default GroupAction;
// eslint-disable-next-line react-refresh/only-export-components
export const InitialAnswer: TAnswers = { answer: '', is_correct: false, mark: 0, sort_number: 0 }; //sort_number: 0,

const inititalState = { question: '', sort_number: 0, score: 0, category_id: '', sub_category_id: '', answers: [], sub_questions: [] };

const InitialonCreate = ({ type }: { type: TQuestion }) => {
   return {
      type: type,
      answers: type === 'checkbox' ? [InitialAnswer, { ...InitialAnswer, sort_number: 1 }] : [],
      sub_questions: [],
      input_type: questionAsset[type as TQuestion]?.input_type,
   };
};

const ActionWrapper = ({ type }: { type: TQuestion }) => {
   const { typeid } = useParams();
   const [subType, setSubType] = useState<{ type: TQuestion; index: number }>({ type: 'checkbox', index: 0 });
   const [action, setAction] = useState<TAction<TQuestionTypes>>({ isOpen: false, type: 'add', data: {} as TQuestionTypes });
   const navigate = useNavigate();
   const {
      control,
      handleSubmit,
      watch,
      setValue,
      reset,
      setError,
      clearErrors,
      formState: { isDirty },
   } = useForm<TQuestionTypes>({
      defaultValues: inititalState, //answers: InitialAnswer
   });

   const Component = useMemo(() => {
      return questionAsset[watch()?.type as TQuestion]?.component;
   }, [watch()?.type]);

   const { fields, append, remove, update } = useFieldArray({ control, name: 'sub_questions' });

   const { data, isFetchedAfterMount, isFetched } = useQuery({
      enabled: typeid !== 'create',
      queryKey: [`questions`, typeid],
      queryFn: () =>
         request<{ data: AllTypesQuestionTypes }>({
            url: `exam/question/id/${typeid}`,
         }),
   });

   useEffect(() => {
      if (typeid === 'create') {
         // reset({ type: type, answers: type === 'checkbox' ? [InitialAnswer, InitialAnswer] : [], sub_questions: [], input_type: questionAsset[type as TQuestion]?.input_type });
         reset({ ...InitialonCreate({ type }) });
         return;
      }

      // end sort hiine, bas subtotal iig hasaj score oo gargaj avj baigaa

      if (data?.data) {
         const subTotal = data?.data?.sub_questions?.reduce((a, b) => a + b.score, 0) ?? 0;
         const mainScore = data?.data?.score - subTotal;
         reset({ ...data?.data, score: mainScore, answers: data?.data?.answers?.sort((a, b) => a.sort_number - b.sort_number) });
      }

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [typeid, isFetchedAfterMount, isFetched]);

   const { isPending, mutate } = useMutation({
      // mutationFn: (body?: Omit<TQuestionTypes, 'id'> | undefined) =>
      mutationFn: (body: TQuestionTypes) =>
         request<TQuestionTypes>({
            method: typeid === 'create' ? 'post' : 'put',
            url: `exam/question-with-answers${typeid !== 'create' ? `/${typeid}` : ``}`,
            body: body,
         }),
      onSuccess: () => {
         navigate('/questions');
      },
   });

   const onSubmit = (data: TQuestionTypes) => {
      if (type === 'checkbox') {
         if (!watch()?.answers?.some((item) => item.is_correct)) {
            toast.error(errorText);
            setError('answers.0.is_correct', { message: errorText });
            setError('answers.1.is_correct', { message: errorText });
            return;
         }
      }

      const subTotal = watch?.('sub_questions')?.reduce((a, b) => a + b.score, 0) ?? 0;

      mutate({ ...data, score: data.score + subTotal, sort_number: 0, answers: data.answers.map((el, index) => ({ ...el, sort_number: index })) }); // type: type,
   };

   const setClose = () => {
      setAction((prev) => ({ ...prev, isOpen: false }));
   };

   UsePrompt({ isBlocked: isDirty && !isPending });

   // , type: TAction<TQuestionTypes>['type']
   const rowAction = (item: TQuestion, type: TAction<TQuestionTypes>['type'], data?: TAction<TQuestionTypes>['data'], index?: number) => {
      setSubType({ type: item, index: index ?? 0 });
      setAction({ isOpen: true, type: type, data: data });
   };

   return (
      <>
         <form onSubmit={handleSubmit(onSubmit)}>
            <Header
               title={questionAsset[watch()?.type as TQuestion]?.label}
               action={
                  <Button disabled={!isDirty} isLoading={isPending} type="submit">
                     <BsSave className="text-sm mr-1" />
                     Хадгалах
                  </Button>
               }
            />
            <div className="wrapper p-7 pt-4 mb-5 flex gap-10 relative">
               <CategorySelect
                  control={control}
                  name="category_id"
                  current="main_category"
                  label="Үндсэн ангилал"
                  onChange={() => {
                     setValue('sub_category_id', '');
                  }}
               />
               <CategorySelect control={control} disabled={!watch()?.category_id} idKey={watch()?.category_id} name="sub_category_id" current="sub_category" label="Дэд ангилал" />
               <div className="h-[1.34rem] w-0.5 bg-primary/40 absolute top-full left-10" />
            </div>
         </form>

         <div className="grid gap-5 grid-cols-[1fr_300px]">
            {Component && <Component {...{ clearErrors, setValue, watch, control }} />}
            <div>
               <div className="flex justify-center mb-4 w-full">
                  <SelectQuestionType rowAction={(item) => rowAction(item as TQuestion, 'add', undefined, fields.length)}>
                     <Button type="button" variant="outline" size="lg" className={cn('flex items-center relative rounded-full py-5 shadow-sm w-full')}>
                        <MdOutlineAdd className="text-base" /> Нэмэлт асуулт нэмэх
                     </Button>
                  </SelectQuestionType>
               </div>
               {fields.length > 0 && (
                  <div className="wrapper relative">
                     <div className="p-3 px-4 border-b text-muted-text font-medium">Нэмэлт асуултууд</div>
                     {fields.map((item, index) => {
                        const Icon = questionAsset[item.type as TQuestion]?.icon;
                        return (
                           <div key={item.id} className="group/items text-xs2 p-3 px-4 hover:bg-primary/10 cursor-pointer relative grid items-center grid-cols-[auto_auto_1fr_auto] gap-2">
                              {<Icon className="text text-primary" />}
                              <div className="text-muted-text">{index + 1}.</div>
                              <div className="one_line" onClick={() => rowAction(item.type, 'edit', item, index)}>
                                 {item.question}
                              </div>
                              <div className="text-primary font-medium">{item.score}</div>
                              <ActionButtons editTrigger={() => rowAction(item.type, 'edit', item, index)} deleteTrigger={() => rowAction(item.type, 'delete', item, index)} />
                           </div>
                        );
                     })}

                     <div className="h-0.5 w-[1.34rem] bg-primary/40 absolute right-full top-6" />
                  </div>
               )}
            </div>
         </div>
         <Dialog
            className={cn('pt-0', action.type === 'delete' ? 'w-[600px]' : 'w-[800px]')}
            isOpen={action.isOpen}
            onOpenChange={(event) => setAction((prev) => ({ ...prev, isOpen: event }))}
            title="Асуулт дотор асуулт нэмэх"
         >
            <SubWrapper {...{ action, setClose, append, update }} type={subType.type} remove={() => remove(subType.index)} indexKey={subType.index} />
         </Dialog>
      </>
   );
};

// update={(data) => update(subType.index, data)}

type TSubWrapperProps = {
   type: TQuestion;
   append: UseFieldArrayAppend<TQuestionTypes, 'sub_questions'>;
   remove: () => void;
   update: UseFieldArrayUpdate<TQuestionTypes, 'sub_questions'>;
   indexKey: number;
} & TActionProps<TQuestionTypes>;

const SubWrapper = ({ type, action, setClose, append, remove, update, indexKey }: TSubWrapperProps) => {
   const { control, handleSubmit, watch, setValue, reset, clearErrors, setError } = useForm<TQuestionTypes>({
      defaultValues: inititalState, //answers: InitialAnswer
   });

   useEffect(() => {
      if (action.type === 'add') {
         reset({ ...InitialonCreate({ type }) });
         return;
      }

      reset(action.data);
   }, [action.type, action.isOpen]);

   const Component = questionAsset[type as TQuestion]?.component;

   const onSubmit = (data: TQuestionTypes) => {
      if (type === 'checkbox') {
         if (!watch()?.answers?.some((item) => item.is_correct)) {
            toast.error(errorText);
            setError('answers.0.is_correct', { message: errorText });
            setError('answers.1.is_correct', { message: errorText });
            return;
         }
      }

      // daraa total_score - iig ni avj hay backend ees
      const finalData = { ...data, total_score: 0, sort_number: indexKey, answers: data.answers.map((el, index) => ({ ...el, sort_number: index })) };

      if (action.type === 'add') {
         append(finalData);
      }

      if (action.type === 'edit') {
         update(indexKey, finalData);
      }

      setClose?.({});
   };

   if (action.type === 'delete') {
      return <DeleteContent setClose={setClose} submitAction={() => (remove(), setClose?.({}))} />;
   }

   // margaash guitseene deee

   return (
      <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
         <Component idPrefix="sub_questions" {...{ clearErrors, setValue, watch, control }} />
         <div className="flex justify-end py-4">
            <Button type="submit">
               <BsSave className="text-sm mr-1" />
               Хадгалах
            </Button>
         </div>
      </form>
   );
};
