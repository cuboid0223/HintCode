import { useState, useEffect } from "react";
import {
  AiOutlineFullscreen,
  AiOutlineFullscreenExit,
  AiOutlineSetting,
} from "react-icons/ai";
import { Settings } from "../Playground";
import SettingsModal from "@/components/Modals/SettingsModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCw, Settings as SettingsIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import * as Radix_Tooltip from "@radix-ui/react-tooltip";
import CustomMarkdown from "@/components/CustomMarkdown";
import { useTheme } from "next-themes";
import { Problem } from "@/utils/types/problem";
import useLocalStorage from "@/hooks/useLocalStorage";
import { problemDataState } from "@/atoms/ProblemData";
import { useRecoilValue } from "recoil";

type PreferenceNavProps = {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  setUserCode: React.Dispatch<React.SetStateAction<string>>;
};

const PreferenceNav: React.FC<PreferenceNavProps> = ({
  setSettings,
  settings,
  setUserCode,
}) => {
  const problem = useRecoilValue(problemDataState);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [selectedLang, setSelectedLang] = useLocalStorage("selectedLang", "py");

  // const handleFullScreen = () => {
  //   if (isFullScreen) {
  //     document.exitFullscreen();
  //   } else {
  //     document.documentElement.requestFullscreen();
  //   }
  //   setIsFullScreen(!isFullScreen);
  // };

  // useEffect(() => {
  //   function exitHandler(e: any) {
  //     if (!document.fullscreenElement) {
  //       setIsFullScreen(false);
  //       return;
  //     }
  //     setIsFullScreen(true);
  //   }

  //   if (document.addEventListener) {
  //     document.addEventListener("fullscreenchange", exitHandler);
  //     document.addEventListener("webkitfullscreenchange", exitHandler);
  //     document.addEventListener("mozfullscreenchange", exitHandler);
  //     document.addEventListener("MSFullscreenChange", exitHandler);
  //   }
  // }, [isFullScreen]);

  const handleSelectedLang = (lang: "py" | "js") => {
    setSelectedLang(lang);
    setSettings({ ...settings, selectedLang: lang });
  };

  const handleRecoveryInitCode = () => {
    setUserCode(problem.starterCode[selectedLang]);
  };

  return (
    <div className="flex items-center justify-between w-full pt-2 ">
      <Select onValueChange={handleSelectedLang}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Python" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="py">Python</SelectItem>
          <SelectItem value="js" disabled>
            JavaScript
          </SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center m-2">
        <TooltipProvider>
          <Tooltip>
            <AlertDialog>
              <AlertDialogTrigger>
                <Radix_Tooltip.Trigger
                  asChild
                  className="font-bold mr-3"
                  type="submit"
                >
                  <RotateCw size={15} />
                </Radix_Tooltip.Trigger>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    確定要復原成初始程式 ? 你現有的程式碼會消失
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <CustomMarkdown theme={resolvedTheme}>
                      {`~~~${selectedLang}\n ${problem.starterCode[selectedLang]}\n~~~`}
                    </CustomMarkdown>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRecoveryInitCode}>
                    確定
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <TooltipContent>
              <p>復原成初始程式</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              className="font-bold mr-3"
              type="submit"
              onClick={() =>
                setSettings({ ...settings, settingsModalIsOpen: true })
              }
            >
              <SettingsIcon size={15} />
            </TooltipTrigger>
            <TooltipContent>設定</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* <button
          className="preferenceBtn group"
          onClick={() =>
            setSettings({ ...settings, settingsModalIsOpen: true })
          }
        >
          <div className="h-4 w-4 text-dark-gray-6 font-bold text-lg">
            <AiOutlineSetting />
          </div>
          <div className="preferenceBtn-tooltip">Settings</div>
        </button> */}

        {/* <button className="preferenceBtn group" onClick={handleFullScreen}>
          <div className="h-4 w-4 text-dark-gray-6 font-bold text-lg">
            {!isFullScreen ? (
              <AiOutlineFullscreen />
            ) : (
              <AiOutlineFullscreenExit />
            )}
          </div>
          <div className="preferenceBtn-tooltip">Full Screen</div>
        </button> */}
      </div>
      {settings.settingsModalIsOpen && (
        <SettingsModal settings={settings} setSettings={setSettings} />
      )}
    </div>
  );
};
export default PreferenceNav;
