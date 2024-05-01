import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import PrivateRoute from '@/lib/core/PrivateRoute';
import SignIn from '@/pages/SignIn';
import { Empty } from '@/assets/richsvg';
import RouteStore, { TRouteOmit } from '@/lib/core/RouteStore';
import { CookiesProvider } from 'react-cookie';

// import useTheme from '@/hooks/useTheme';

const converSome = (Item: TRouteOmit) => {
   if (!Item.isHide) {
      return Item;
   }

   return { ...Item, to: Item.to.replace('/:typeid', '') };
};

const router = createBrowserRouter(
   createRoutesFromElements(
      <>
         <Route path="/" element={<PrivateRoute toSign />}>
            {RouteStore.map((Item, index) => {
               return Item.subMenu ? (
                  <Route key={index} path={Item.to}>
                     {Item.subMenu?.map((childE, index) => {
                        return (
                           <Route
                              key={index}
                              path={childE.to}
                              element={childE.component ? <childE.component breadcrumbs={[{ ...converSome(childE), isActive: true }]} /> : <div>{childE.label}</div>}
                           />
                        );
                     })}
                  </Route>
               ) : (
                  <Route key={index} path={Item.to} element={Item.component ? <Item.component breadcrumbs={[{ ...converSome(Item), isActive: true }]} /> : <div>{Item.label}</div>} />
               );
            })}
         </Route>

         <Route path="/" element={<PrivateRoute />}>
            <Route path="/signin" element={<SignIn />} />
         </Route>

         <Route
            path="*"
            element={
               <div className="h-[70dvh] flex items-center justify-center flex-col">
                  <Empty />
                  <h3 className="text-lg">Хуудас олдсонгүй</h3>
               </div>
            }
         />
      </>
   )
);

function App() {
   return (
      <CookiesProvider>
         <RouterProvider router={router} />
      </CookiesProvider>
   );
}

export default App;
