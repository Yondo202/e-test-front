// import { useMatches, matchRoutes, matchPath } from "react-router-dom"
import { useQuery, useMutation } from '@tanstack/react-query';
import { request, UseReFetch } from '@/lib/core/request';
import { useEffect, useState } from 'react';
import { DataTable, BreadCrumb, AnimatedTabs, Drawer, Button, TextInput, DeleteContent, SelectInput, type TOption, Badge } from '@/components/custom';
import { type FinalRespnse, type TAction, type TActionProps, ATypes } from '@/lib/sharedTypes';
import { ColumnDef } from '@tanstack/react-table';
import { TBreadCrumb } from '@/components/custom/BreadCrumb';
import { useForm } from 'react-hook-form';
import { MdOutlineAdd } from 'react-icons/md';

export type TCategory = {
   id: string;
   name: string;
   created_at?: string;
   updated_at?: string;

   category_id?: string;
   // org_id:string
};

const catAsset = {
   main_category: {
      label: 'Үндсэн ангилал',
      url: 'cats/list/category',
   },
   sub_category: {
      label: 'Дэд ангилал',
      url: 'cats/list/sub-category',
   },
} as const;

export type TKeys = keyof typeof catAsset;

export const useGetCategories = ({ current }: { current: TKeys }) => {
   return useQuery({
      queryKey: [`category/${current}`, current],
      queryFn: () =>
         request<FinalRespnse<TCategory>>({
            method: 'post',
            url: catAsset[current]?.url,
            offAlert: true,
            filterBody: {
               pagination: {
                  page: 1,
                  page_size: 20,
               },
            },
         }),
   });
};

const Groups = ({ breadcrumbs }: { breadcrumbs: TBreadCrumb[] }) => {
   const [mainCat, setMainCat] = useState<TOption[]>([]);
   const [action, setAction] = useState<TAction<TCategory>>({ isOpen: false, type: 'add', data: {} as TCategory });
   const [current, setCurrent] = useState<TKeys>('main_category');
   const { data, isLoading, isRefetching } = useGetCategories({ current });

   useEffect(() => {
      if (current === 'main_category') {
         setMainCat(data?.data ? data?.data.map((item) => ({ label: item.name, value: item.id })) : []);
      }
   }, [current, isLoading, isRefetching]);

   const setClose = () => {
      setAction((prev) => ({ ...prev, isOpen: false }));
   };

   const rowAction = (data: TAction<TCategory>) => {
      setAction(data);
   };

   return (
      <div>
         <BreadCrumb pathList={breadcrumbs} />
         <AnimatedTabs
            items={Object.keys(catAsset)?.map((item) => ({ label: catAsset[item as TKeys]?.label, key: item, disabled: item === 'sub_category' && mainCat?.length === 0 }))}
            activeKey={current}
            onChange={(value) => setCurrent(value as TKeys)}
         />
         <DataTable
            data={data?.data ?? []}
            columns={
               current === 'main_category'
                  ? columnDef
                  : [
                       ...columnDef,
                       {
                          header: 'Үндсэн ангилал',
                          accessorKey: 'category_id',
                          cell: ({ row }) => <Badge variant="secondary">{mainCat.find((item) => item?.value === row.original.category_id)?.label}</Badge>,
                       },
                    ]
            }
            isLoading={isLoading}
            rowAction={rowAction}
            headAction={
               <Drawer
                  open={action.isOpen}
                  onOpenChange={(event) => setAction((prev) => ({ ...prev, isOpen: event }))}
                  title={action.type === 'delete' ? '' : `${catAsset[current]?.label} ${action.type === 'add' ? `нэмэх` : `засах`}`}
                  content={<GroupAction {...{ current, setClose, action, options: mainCat }} />}
                  className={`py-10 max-w-lg`}
               >
                  <Button size="sm" className="rounded-full" variant="outline" onClick={() => setAction((prev) => ({ ...prev, isOpen: true, type: 'add' }))}>
                     <MdOutlineAdd /> {catAsset[current]?.label}
                  </Button>
               </Drawer>
            }
         />
      </div>
   );
};

export default Groups;

const GroupAction = ({ current, action, setClose, options }: TActionProps<TCategory> & { current: TKeys; options: TOption[] }) => {
   const {
      control,
      handleSubmit,
      reset,
      formState: { isDirty },
   } = useForm({ defaultValues: { name: '', cat_id: '' } });
   const actionUrl = catAsset[current]?.url?.replace('/list', '');

   const { isPending, mutate } = useMutation({
      mutationKey: [`category/${current}`, current],
      mutationFn: (body?: Omit<TCategory, 'id'> | undefined) =>
         request<Omit<TCategory, 'id'>>({
            method: ATypes[action.type]?.apiMethod,
            url: action.type !== 'add' ? actionUrl + `/${action.data?.id}` : actionUrl,
            body: body,
            filterBody: {
               pagination: {
                  page: 1,
                  page_size: 20,
               },
            },
         }),
      onSuccess: () => {
         setClose?.({});
         UseReFetch({ queryKey: `category/${current}`, queryId: current });
      },
   });

   useEffect(() => {
      if (action.type !== 'add') {
         if (current === 'sub_category') {
            reset({ ...action.data, cat_id: action.data?.category_id });
            return;
         }
         reset(action.data);
      }
   }, [action.isOpen]);

   const onSubmit = (data: Omit<TCategory, 'id'>) => {
      mutate(data);
   };

   // UsePrompt({ isBlocked: isDirty });

   if (action.type === 'delete') {
      return <DeleteContent setClose={setClose} submitAction={() => mutate(undefined)} isLoading={isPending} className="pb-6" />;
   }

   return (
      <form onSubmit={handleSubmit(onSubmit)}>
         {current === 'sub_category' && (
            <SelectInput
               options={options}
               label={`${catAsset['main_category']?.label} сонгох`}
               control={control}
               className="mb-10"
               name="cat_id"
               rules={{ required: `${catAsset['main_category']?.label} сонго` }}
            />
         )}

         <TextInput
            floatLabel={current !== 'sub_category'}
            autoFocus={current !== 'sub_category'}
            placeholder={`${catAsset[current]?.label}ын нэр`}
            label={`${catAsset[current]?.label}ын нэр оруулах`}
            name="name"
            control={control}
            rules={{ required: `${catAsset[current]?.label} оруулна уу` }}
         />
         <div className="flex justify-end w-full pt-10">
            <Button isLoading={isPending} type="submit" disabled={!isDirty}>
               Хадгалах
            </Button>
         </div>
      </form>
   );
};

const columnDef: ColumnDef<TCategory>[] = [
   {
      header: 'Ангилалын нэр',
      accessorKey: 'name',
      // size:500,
   },
   {
      header: 'Үүсгэсэн огноо',
      accessorKey: 'created_at',
      cell: ({ row }) => row.original?.created_at?.slice(0, 16).replace('T', ' '),
   },
   {
      header: 'Өөрчилсөн огноо',
      accessorKey: 'updated_at',
      cell: ({ row }) => row.original?.updated_at?.slice(0, 16).replace('T', ' '),
   },
];
