import LeftMenu from './LeftMenu';
import { Outlet } from 'react-router-dom';

const SignedInRoot = () => {
   return (
      <div className="grid grid-cols-[auto_1fr]">
         <LeftMenu />

         <div className="flex flex-col pt-0 pl-10 pr-10 pb-12 h-dvh max-h-full overflow-y-auto">
            <div className="w-full max-w-screen-2xl self-center">
               <Outlet />
            </div>
         </div>
      </div>
   );
};

export default SignedInRoot;
