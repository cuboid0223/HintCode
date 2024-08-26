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
import CustomMarkdown from "@/components/Workspace/components/CustomMarkdown";
import { useTheme } from "next-themes";
import { useLocalStorage } from "@uidotdev/usehooks";
import { problemDataState } from "@/atoms/ProblemData";
import { useRecoilValue } from "recoil";
import { Settings } from "@/types/global";
import { EDITOR_FONT_SIZES } from "@/utils/const";

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
  const { resolvedTheme } = useTheme();
  const [selectedLang, setSelectedLang] = useLocalStorage("selectedLang", "py");
  const [fontSize, setFontSize] = useLocalStorage(
    "playground-fontSize",
    "16px"
  );

  const handleSelectedLang = (lang: "py" | "js") => {
    setSelectedLang(lang);
    setSettings({ ...settings, selectedLang: lang });
  };

  const handleRecoveryInitCode = () => {
    setUserCode(problem.starterCode[selectedLang]);
  };

  const handleSelectedFontSize = (fontSize: string) => {
    setFontSize(fontSize);
    setSettings({ ...settings, fontSize });
  };

  return (
    <div className="flex items-center justify-between w-full ">
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
            <AlertDialog>
              <AlertDialogTrigger>
                <Radix_Tooltip.Trigger
                  asChild
                  className="font-bold mr-3"
                  type="submit"
                >
                  <SettingsIcon size={15} />
                </Radix_Tooltip.Trigger>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>字體大小</AlertDialogTitle>
                  <AlertDialogDescription className="flex justify-between items-center">
                    <h3 className="">選擇編輯器字體大小</h3>
                    <Select onValueChange={handleSelectedFontSize}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={fontSize} />
                      </SelectTrigger>
                      <SelectContent>
                        {EDITOR_FONT_SIZES.map((fs, idx) => (
                          <SelectItem value={fs} key={idx}>
                            {fs}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
            <TooltipContent>設定</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
export default PreferenceNav;
