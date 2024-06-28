import { DocumentData, DocumentReference, updateDoc } from "firebase/firestore";

const ACCEPTED_BASIC_SCORE_RATE = 0.8;

const updateUserProblemScore = async (
  userProblemRef: DocumentReference<DocumentData>,
  problemScore: number,
  messagesLength: number
) => {
  const basicScore = problemScore * ACCEPTED_BASIC_SCORE_RATE;
  const extraScore = problemScore * (1 - ACCEPTED_BASIC_SCORE_RATE);
  await updateDoc(userProblemRef, {
    score: basicScore + (extraScore - messagesLength),
  });
};

export default updateUserProblemScore;
