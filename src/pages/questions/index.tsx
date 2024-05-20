import { useQuery, useMutation } from '@tanstack/react-query';
import { request } from '@/lib/core/request';
import { type FinalRespnse, type TAction } from '@/lib/sharedTypes';
import { BreadCrumb, Header, Button, DataTable, Badge, Dialog, DeleteContent } from '@/components/custom'; // DataTable
import { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { TBreadCrumb } from '@/components/custom/BreadCrumb';
import { MdOutlineAdd } from 'react-icons/md';
import { FiChevronDown } from 'react-icons/fi';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { questionAsset } from './Action';
import { useState } from 'react';

export type TQuestion = 'text' | 'checkbox' | 'fill';
export type TInputType = 'multi_select' | 'select' | 'text' | 'richtext' | 'essay' | 'fill' | 'fill_with_choice';
export type TTempType = 'question' | 'answer' | 'wrong_answer'

//  const fillerInputTypes = {
//    question: {
//       label: 'Асуулт',
//    },
//    answer: {
//       label: 'Хариулт',
//    },
//    wrong_answer: {
//       label: 'Буруу хариулт',
//    },
// };

export type TInputTypeTab = {
   label: string;
   key: TInputType;
};

// only use on fill type
type TFillAnswer = {
   fill_index?: number;
   temp_type?: TTempType;
};

export type TAnswers = {
   answer: string;
   is_correct: boolean;
   // sub_question_id?: string;
   sort_number: number;
   mark: number; // zowhon multi select tei ued
} & TFillAnswer;

export type AllTypesQuestionTypes = {
   id: string;
   question: string;
   score: number;
   type: TQuestion;
   category_id: string;
   answers: TAnswers[];
   sub_category_id: string;
   input_type: TInputType;

   sort_number: number;
   total_score: number;
   created_at: string;

   sub_questions: TQuestionTypes[];
};

export type TQuestionTypes = Omit<AllTypesQuestionTypes, 'created_at' | 'total_score'>;

const Groups = ({ breadcrumbs }: { breadcrumbs: TBreadCrumb[] }) => {
   const [deleteAction, setDeleteAction] = useState({ isOpen: false, id: '' });
   // const [isOpen, setIsOpen] = useState(false);
   const navigate = useNavigate();

   const { data, isLoading, refetch } = useQuery({
      queryKey: [`questions`],
      queryFn: () =>
         request<FinalRespnse<AllTypesQuestionTypes>>({
            method: 'post',
            url: `exam/list/question`,
            offAlert: true,
            filterBody: {
               pagination: {
                  page: 1,
                  page_size: 1000,
               },
            },
         }),
   });

   const { isPending, mutate } = useMutation({
      mutationFn: () =>
         request<TQuestionTypes>({
            method: 'delete',
            url: `exam/question/${deleteAction.id}`,
         }),
      onSuccess: () => {
         refetch();
         setDeleteAction({ isOpen: false, id: '' });
      },
   });

   const rowAction = (item: TQuestion) => {
      navigate(`${breadcrumbs.find((item) => item.isActive)?.to}/create?type=${item}`);
   };

   return (
      <div>
         <BreadCrumb pathList={breadcrumbs} />
         <Header
            title={breadcrumbs.find((item) => item.isActive)?.label}
            action={
               <SelectQuestionType rowAction={rowAction}>
                  <Button>
                     <MdOutlineAdd className="text-base" /> Асуумж нэмэх <FiChevronDown />
                  </Button>
               </SelectQuestionType>
            }
         />

         <DataTable
            data={data?.data ?? []}
            columns={columnDef}
            isLoading={isLoading}
            rowAction={(data: TAction<AllTypesQuestionTypes>) => {
               if (data.type === 'edit') {
                  navigate(`${breadcrumbs.find((item) => item.isActive)?.to}/${data.data?.id}`);
                  return;
               }
               setDeleteAction({ isOpen: true, id: data.data?.id ?? '' });
            }}
         />
         <Dialog isOpen={deleteAction.isOpen} onOpenChange={(e) => setDeleteAction((prev) => ({ ...prev, isOpen: e }))}>
            <DeleteContent setClose={() => setDeleteAction({ isOpen: false, id: '' })} submitAction={mutate} isLoading={isPending} className="pb-6" />
         </Dialog>
      </div>
   );
};

export default Groups;

type TSelectQuestionProps = {
   children: React.ReactNode;
   rowAction: (item: TQuestion, type?: TAction<TQuestionTypes>['type'], data?: TAction<TQuestionTypes>) => void;
};

export const SelectQuestionType = ({ children, rowAction }: TSelectQuestionProps) => {
   return (
      <Popover>
         <PopoverTrigger asChild>{children}</PopoverTrigger>

         <PopoverContent className="p-6 w-78 flex flex-col gap-4" align="end" sideOffset={8}>
            {Object.keys(questionAsset)?.map((item, index) => {
               const Icon = questionAsset[item as TQuestion]?.icon;
               return (
                  <div
                     // to={`${breadcrumbs.find((item) => item.isActive)?.to}/create?type=${item}`}
                     onClick={() => rowAction(item as TQuestion)}
                     className="group p-4 hover:bg-primary/5 rounded-md cursor-pointer grid grid-cols-[auto_1fr] gap-4 border border-primary/20"
                     key={index}
                  >
                     <Icon className="text-xl text-secondary mt-1" />

                     <div className="flex flex-col gap-1">
                        <span className="font-medium">{questionAsset[item as TQuestion]?.label}</span>
                        <span className="text-muted-text text-xs">{questionAsset[item as TQuestion]?.description}</span>
                     </div>
                  </div>
               );
            })}
         </PopoverContent>
      </Popover>
   );
};

const columnDef: ColumnDef<AllTypesQuestionTypes>[] = [
   {
      header: 'Асуулт',
      accessorKey: 'question',
      // size:500,
   },
   {
      header: 'Нийт оноо',
      accessorKey: 'score',
      size: 100,
      // cell: ({ row }) => <Badge variant="outline">{row.original?.score}</Badge>,
      cell: ({ row }) => (
         <Badge variant="outline" className="w-fit text-[11px] py-0.5 px-2 font-medium text-primary bg-secondary/5">
            {row.original?.score}
         </Badge>
      ),
   },
   {
      header: 'Үүсгэсэн огноо',
      accessorKey: 'created_at',
      cell: ({ row }) => row.original?.created_at?.slice(0, 10).replace('T', ' '),
   },
   {
      header: 'Өөрчилсөн огноо',
      accessorKey: 'updated_at',
      cell: ({ row }) => row.original?.created_at?.slice(0, 10).replace('T', ' '),
   },
   {
      header: 'Төрөл',
      accessorKey: 'type',
      cell: ({ row }) => {
         const Icon = questionAsset[row.original?.type as TQuestion]?.icon;
         // return row.original?.type === 'checkbox' ? <Badge variant="secondary">Сонголттой</Badge> : <Badge variant="secondary">Бичгээр</Badge>
         return (
            <div className="flex items-center gap-3">
               {Icon && <Icon className="text-md text-primary/60" />}
               <Badge variant="secondary" className="w-fit text-[11px] py-0.5 font-medium text-primary/90">
                  {questionAsset[row.original?.type as TQuestion]?.label}{' '}
               </Badge>
            </div>
         );
      },
   },

   // {
   //    header: 'Хариултын тоо',
   //    accessorKey: 'answers.length',
   // }, category, bolon sub category nem
];
