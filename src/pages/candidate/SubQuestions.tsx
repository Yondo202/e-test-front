import { Badge } from '@/components/custom';
import { Controller, useForm } from 'react-hook-form';
import { type Socket } from 'socket.io-client';
import { type AllTypesQuestionTypes } from '@/pages/questions';
import { questionAsset } from './ExamStartAction';
import { useEffect } from 'react';

type TSubQuestionProps = {
   // questions: PickedQuestionTypes[];
   parentQuestion: AllTypesQuestionTypes;
   progressId: string;
   socket: Socket;
   score_visible: boolean;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   subQuestionsValue: any;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   parentValue: any;
};

const SubQuestions = ({ parentQuestion, score_visible, socket, progressId, subQuestionsValue, parentValue }: TSubQuestionProps) => {
   const { control, watch, reset } = useForm({ mode: 'onChange' });

   useEffect(() => {
      if (subQuestionsValue) {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         const settleValue: any = {};
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         subQuestionsValue?.forEach((item: any) => {
            // const item = tempArr.find((elem) => elem.id === item.question_id);
            if (item?.input_type === 'multi_select' || item?.type === 'fill') {
               settleValue[item.question_id ?? ''] = item.choices;
            }
            if (item?.input_type === 'select') {
               settleValue[item.question_id ?? ''] = item.choice;
            }
            if (item?.type === 'text') {
               settleValue[item.question_id ?? ''] = item.answer;
            }
         });
         reset(settleValue);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const GenerateValue = () => {
      if (parentQuestion?.input_type === 'multi_select' || parentQuestion?.type === 'fill') {
         return { choices: parentValue };
      }
      if (parentQuestion?.input_type === 'select') {
         return { choice: parentValue };
      }
      if (parentQuestion?.type === 'text') {
         return { answer: parentValue };
      }
   };

   useEffect(() => {
      const FinalSubQuestion = Object.keys(watch())
         ?.filter((item) => !!watch(item))
         .map((item) => {
            const found = parentQuestion.sub_questions?.find((element) => element.id === item);
            const subAssets = { type: found?.type, input_type: found?.input_type, question_id: item };
            if (found?.type === 'text') {
               return { ...subAssets, answer: watch(item) };
            }

            if (found?.type === 'fill' || found?.input_type === 'multi_select') {
               return { ...subAssets, choices: watch(item) };
            }

            if (found?.input_type === 'select') {
               return { ...subAssets, choice: watch(item) };
            }

            // return {};
            // if (found?.type === "fill") {
            //    return { ...subAssets, [found.input_type === ""  `answer`]: watch(item) };
            // }
            // return { type: found?.type, input_type: found?.input_type, question_id: item };
         });

      socket?.emit(
         'save_progress',
         JSON.stringify({
            ...GenerateValue(),
            question_id: parentQuestion.id,
            // choices: FillValues,
            id: progressId,
            type: parentQuestion.type,
            input_type: parentQuestion.input_type,

            sub_questions: FinalSubQuestion ?? [],
         })
      );

      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [watch()]);

   // console.log(progressId, '----------->progressId');
   // console.log(watch(), '-------------------->watch');

   return (
      <div className="pt-8 pl-12 max-sm:pl-1">
         <div className="wrapper mb-2.5 p-8 py-3 text-sm border-b font-medium truncate border-t-[2px] border-t-primary">
            {/* <span className="text-primary/80 font-semibold mr-3">{index + 1}.</span>  */}
            Нэмэлт асуултууд
         </div>
         {parentQuestion?.sub_questions?.map((element, ind) => {
            return (
               <div className="wrapper mb-2.5 p-8 py-6 relative" key={ind}>
                  <div className="flex items-center gap-3 justify-between mb-7">
                     <Badge variant="secondary" className="py-1 text-xs gap-2">
                        <span className="font-medium font-base">{ind + 1}</span>
                        <span className="text-muted-text"> - Асуулт</span>
                     </Badge>
                     {score_visible && (
                        <Badge variant="secondary" className="py-1 text-xs gap-2">
                           <span className="font-medium font-base">{element.score}</span>
                           <span className="text-muted-text"> - Оноо</span>
                        </Badge>
                     )}
                  </div>
                  <Controller
                     control={control}
                     name={element.id}
                     rules={{ required: true }}
                     render={({ field }) => {
                        return <div>{questionAsset[element.type]?.component({ question: element, field: field })}</div>;
                     }}
                  />
               </div>
            );
         })}
      </div>
   );
};

export default SubQuestions;
