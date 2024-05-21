import { useQuery } from '@tanstack/react-query';
import { request } from '@/lib/core/request';
import { type FinalRespnse, type TAction } from '@/lib/sharedTypes';
import { DataTable, BreadCrumb, Header, Button, Drawer, Badge } from '@/components/custom';
import { ColumnDef } from '@tanstack/react-table';
import { TBreadCrumb } from '@/components/custom/BreadCrumb';
import { Link, useNavigate } from 'react-router-dom';
import { MdOutlineAdd } from 'react-icons/md';
import ConfigAction from '@/pages/exams/ConfigAction';
import { useState } from 'react';
import { finalRenderDate } from '@/lib/utils';
import { IoArrowForwardSharp } from 'react-icons/io5';

export type TExam = {
   id: number;
   name: string;
   code: string;
   description: string;
   status: string;
   pass_score: number;
   all_score: number;
   max_score: number;
   min_score: number;
   avg_score: number;
   duration_min: number;
   take_per_user: number;
   
   category_id: string;
   sub_category_id: string;
   reviewable: boolean;
   scrumble_questions: boolean;
   score_visible: boolean;
   active_start_at: string;
   active_end_at: string;
   created_at: Date;
   updated_at: Date;
};

// {
//    "deleted_at": null,
//    "deleted_by": null,
//    "created_by": null,
//    "updated_by": null
//  },

// eslint-disable-next-line react-refresh/only-export-components

const Exams = ({ breadcrumbs }: { breadcrumbs: TBreadCrumb[] }) => {
   const navigate = useNavigate();
   const [action, setAction] = useState<TAction<TExam>>({ isOpen: false, type: 'add', data: {} as TExam });

   const { data, isLoading, refetch } = useQuery({
      queryKey: ['exam/list'],
      queryFn: () =>
         request<FinalRespnse<TExam[]>>({
            method: 'post',
            url: 'exam/list',
            offAlert: true,
            filterBody: {
               pagination: {
                  page: 1,
                  page_size: 1000,
               },
            },
         }),
   });

   const afterSuccess = (id: string) => {
      setAction((prev) => ({ ...prev, isOpen: false }));
      refetch();
      if (id !== 'delete') {
         navigate(id);
      }
   };

   return (
      <div>
         <BreadCrumb pathList={breadcrumbs} />
         <Header
            title={breadcrumbs.find((item) => item.isActive)?.label}
            action={
               <Button onClick={() => setAction({ isOpen: true, type: 'add' })} className="rounded-full">
                  <MdOutlineAdd className="text-base" /> Шалгалт үүсгэх
               </Button>
            }
         />
         
         <DataTable defaultSortField="active_start_at" rowAction={(data) => setAction(data)} data={data?.data ?? []} columns={columnDef} isLoading={isLoading} />

         <Drawer
            open={action.isOpen}
            onOpenChange={(e) => setAction((prev) => ({ ...prev, isOpen: e }))}
            title="Шалгалтын тохиргоо"
            content={<ConfigAction action={action} afterSuccess={afterSuccess} />}
            className="py-2 max-w-4xl"
            titleClassName="pt-2 pb-3"
         />
      </div>
   );
};

export default Exams;

const columnDef: ColumnDef<TExam>[] = [
   {
      header: 'Шалгалт',
      accessorKey: 'name',
      // size:500,
   },
   // {
   //    header: 'Тайлбар',
   //    accessorKey: 'description',
   // },
   {
      header: 'Эхлэх огноо',
      accessorKey: 'active_start_at',
      cell: ({ row }) => {
         return finalRenderDate(row.original?.active_start_at);
      },
   },
   {
      header: 'Дуусах огноо',
      accessorKey: 'active_end_at',
      cell: ({ row }) => {
         return finalRenderDate(row.original?.active_end_at);
      },
   },
   {
      header: 'Код',
      accessorKey: 'code',
      size: 100,
      cell: ({ row }) => {
         return (
            row.original.code && (
               <Badge variant="secondary" className="w-fit text-[10px] font-medium text-primary/90">
                  {row.original.code}
               </Badge>
            )
         );
      },
   },
   {
      header: '',
      accessorKey: 'as_action',
      size: 100,
      cell: ({ row }) => (
         <Link to={row.original?.id?.toString()??'/'} className='w-full leading-11 h-11 text-[11px] font-medium text-primary/90 flex items-center gap-1 hover:decoration-primary hover:underline'>
            Дэлгэрэнгүй <IoArrowForwardSharp />
         </Link>
      ),
   },
];
