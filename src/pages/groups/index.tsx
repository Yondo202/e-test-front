// import { useMatches, matchRoutes, matchPath } from "react-router-dom"
import { useQuery } from '@tanstack/react-query';
import { request } from '@/lib/core/request';
import { useState } from 'react';
import { DataTable, BreadCrumb, AnimatedTabs } from '@/components/custom';
import { ColumnDef } from '@tanstack/react-table';
import { TBreadCrumb } from '@/components/custom/BreadCrumb';

export type TGroup = {
   userId: number;
   id: number;
   title: string;
   completed: boolean;
};

const groupAsset = [
   { label: 'Үндсэн бүлэг', key: 'main_group' },
   { label: 'Дэд бүлэг', key: 'sub_group' },
];

const Groups = ({ breadcrumbs }: { breadcrumbs: TBreadCrumb[] }) => {
   const [current, setCurrent] = useState(groupAsset[0]?.key);
   const { data = [], isLoading } = useQuery({ queryKey: ['groups'], queryFn: () => request<TGroup[]>({ mainUrl: 'https://jsonplaceholder.typicode.com/', url: 'todos' }) });

   return (
      <div>
         <BreadCrumb pathList={breadcrumbs} />
         <AnimatedTabs items={groupAsset} activeKey={current} onChange={(e) => setCurrent(e)} />
         <DataTable data={data} columns={columnDef} isLoading={isLoading} />
      </div>
   );
};

export default Groups;

const columnDef: ColumnDef<TGroup>[] = [
   {
      header: 'userId',
      accessorKey: 'userId',
      // size:500,
   },
   {
      header: 'Гарчиг',
      accessorKey: 'title',
   },
   {
      header: 'completed',
      accessorKey: 'completed',
   },
   {
      header: 'id',
      accessorKey: 'id',
   },
];
