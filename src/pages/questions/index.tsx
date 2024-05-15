import { useQuery } from '@tanstack/react-query';
import { request } from '@/lib/core/request';
import { type FinalRespnse, type TAction } from '@/lib/sharedTypes';
import { BreadCrumb, Header, Button, DataTable, Badge } from '@/components/custom'; // DataTable
import { ColumnDef } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { TBreadCrumb } from '@/components/custom/BreadCrumb';
import { MdOutlineAdd } from 'react-icons/md';
import { FiChevronDown } from 'react-icons/fi';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { questionAsset } from './Action';

export type TQuestion = 'text' | 'checkbox'; // filler
// richtext                                 filler_with_choice
// export type TInputType = 'multi_select' | 'select' | 'text' | 'text_long' | 'text_format' | 'filler' | 'filler_select';
export type TInputType = 'multi_select' | 'select' | 'text' | 'richtext' | 'text_format' | 'filler' | 'filler_with_choice';
// | 'drag_drop' | 'multi_drag_drop';

export type TInputTypeTab = {
   label: string;
   key: TInputType;
};

export type TAnswers = {
   answer: string;
   is_correct: boolean;
   sub_question_id?: string;
   // sort_number: number;

   mark: number; // zowhon multi select tei ued
};

type AllTypesQuestionTypes = {
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

export type TQuestionTypes = Omit<AllTypesQuestionTypes, 'created_at' | 'sort_number' | 'total_score'>;

const Groups = ({ breadcrumbs }: { breadcrumbs: TBreadCrumb[] }) => {
   const navigate = useNavigate();
   const { data, isLoading } = useQuery({
      queryKey: [`questions`],
      queryFn: () =>
         request<FinalRespnse<AllTypesQuestionTypes>>({
            method: 'post',
            url: `exam/list/question`,
            offAlert: true,
            filterBody: {
               pagination: {
                  page: 1,
                  page_size: 20,
               },
            },
         }),
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
         <DataTable data={data?.data ?? []} columns={columnDef} isLoading={isLoading} />
      </div>
   );
};

export default Groups;

type TSelectQuestionProps = {
   children: React.ReactNode;
   rowAction: (item: TQuestion, type?: TAction<TQuestionTypes>['type'], data?:TAction<TQuestionTypes>) => void;
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
      header: 'Үүсгэсэн огноо',
      accessorKey: 'created_at',
      cell: ({ row }) => row.original?.created_at?.slice(0, 16).replace('T', ' '),
   },
   {
      header: 'Төрөл',
      accessorKey: 'type',
      cell: ({ row }) => (row.original?.type === 'checkbox' ? <Badge variant="secondary">Сонголттой</Badge> : <Badge variant="secondary">Бичгээр</Badge>),
   },

   // {
   //    header: 'Хариултын тоо',
   //    accessorKey: 'answers.length',
   // }, category, bolon sub category nem
];
