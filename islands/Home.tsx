import { useState, useRef, useEffect } from "preact/hooks";
import ApiForm from "./APIForm.tsx";
import ApiResponseBox from "./APIResponseBox.tsx";

export default function Home({ host }: { host: string }) {
  const [generatedURL, setGeneratedURL] = useState<string | null>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  const DEFAULT_WIDTH = 325;

  useEffect(() => {
    const savedWidth = localStorage.getItem("sliderLeftPanelWidth");
    if (savedWidth && leftPanelRef.current) {
      leftPanelRef.current.style.width = `${savedWidth}px`;
      rightPanelRef.current.style.flex = "1";
    }
  }, []);

  const handleMouseMove = (event: MouseEvent) => {
    if (!leftPanelRef.current || !rightPanelRef.current) return;

    const containerWidth = leftPanelRef.current.parentElement?.offsetWidth || 0;

    const newLeftWidth = Math.min(
      Math.max(event.clientX, 100),
      containerWidth - 100
    );

    leftPanelRef.current.style.width = `${newLeftWidth}px`;
    rightPanelRef.current.style.flex = "1";

    localStorage.setItem("sliderLeftPanelWidth", newLeftWidth.toString());
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = () => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div class="flex flex-row bg-gray-100 p-4 h-screen overflow-hidden">
      <div
        ref={leftPanelRef}
        class="bg-white p-6 rounded-lg shadow-md overflow-y-auto"
        style={{ width: `${DEFAULT_WIDTH}px` }}
      >
        <ApiForm host={host} callback={setGeneratedURL} />
      </div>

      <div
        class="cursor-col-resize bg-gray-300"
        style={{ width: "4px", cursor: "col-resize" }}
        onMouseDown={handleMouseDown}
      ></div>

      <div
        ref={rightPanelRef}
        class="bg-white p-6 rounded-lg shadow-md flex-1 overflow-y-auto"
      >
        <ApiResponseBox url={generatedURL} />
      </div>
    </div>
  );
}
