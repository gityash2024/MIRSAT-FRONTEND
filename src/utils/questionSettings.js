import { isQuestionScored } from './inspectionScoring';
import { isRequiredQuestion } from './inspectionProgress';

export const updateQuestionSettings = (question, changes) => ({
  ...question,
  isScored: isQuestionScored(question),
  required: isRequiredQuestion(question),
  // These legacy aliases no longer control scoring. Normalize them when the
  // author edits settings so Required alone controls completion afterwards.
  mandatory: true,
  requirementType: 'mandatory',
  ...changes,
});
