import {
  submissionsState,
  SubmissionsState,
} from "@/atoms/submissionsDataAtom";
import isAllTestCasesAccepted from "@/utils/testCases/isAllTestCasesAccepted";
import React, { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { ACCEPTED_STATUS_ID } from "@/utils/const";
const DaGaKoToWaRuDialog = ({}) => {
  const [isDaGaKoToWaRuDialogOpen, setIsDaGaKoToWaRuDialogOpen] =
    useState(false);
  const [submissions, setSubmissions] =
    useRecoilState<SubmissionsState>(submissionsState);

  useEffect(() => {
    function getAllButLastSubmission(arr: SubmissionsState) {
      return arr.slice(0, -1);
    }
    const DaGa_KoToWaRu = () => {
      /*
    測試隱藏 testcase 沒通過，其餘皆通過，判斷使用者使用暴力破解法
    (本研究經費不足，故無法透過大量測資去預防暴力破解法，故使用隱藏的測試資料)
    並跳出一個 JoJo 梗嘲諷
    */
      if (submissions?.length === 0) return;
      const hiddenCase = submissions[submissions.length - 1];
      // const isHiddenCaseAccepted = hiddenCase.status.id === ACCEPTED_STATUS_ID;
      const isAllDisplayTestCasesAccepted = isAllTestCasesAccepted(
        getAllButLastSubmission(submissions)
      );
      if (
        isAllDisplayTestCasesAccepted &&
        hiddenCase.status.id !== ACCEPTED_STATUS_ID
      )
        setIsDaGaKoToWaRuDialogOpen(true);
    };

    DaGa_KoToWaRu();
  }, [submissions]);

  return (
    <div>
      <Dialog
        open={isDaGaKoToWaRuDialogOpen}
        onOpenChange={(open) => setIsDaGaKoToWaRuDialogOpen(open)}
      >
        <DialogContent className="">
          <Image
            src="/DaGaKoToWaRu.jpg"
            alt="DaGaKoToWaRu"
            height={700}
            width={450}
            priority
          />
          <DialogHeader>
            <DialogTitle>だが、断る。</DialogTitle>
            <DialogDescription>
              當您看到岸邊露伴 代表你已經中了天堂之門
              &quot;無法使用暴力破解法&ldquo;
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DaGaKoToWaRuDialog;
