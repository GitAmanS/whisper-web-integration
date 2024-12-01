import { useRef, useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import { saveAs } from "file-saver";
import { pdfExporter } from "quill-to-pdf"; // Import the pdfExporter
import { formatAudioTimestamp } from "../utils/AudioUtils";
import { TranscriberData } from "../hooks/useTranscriber";
import { useSpring, animated } from "@react-spring/web";

interface Props {
  transcribedData: TranscriberData | undefined;
}

export default function Transcript({ transcribedData }: Props) {
  const editorRef = useRef<ReactQuill | null>(null);
  const [showTimestamps, setShowTimestamps] = useState<boolean>(true);


    // Animation for the toggle button
    const buttonAnimation = useSpring({
        backgroundColor: showTimestamps ? "#3182ce" : "#f56565", // Blue for Show, Red for Hide
        transform: showTimestamps ? "scale(1)" : "scale(1.1)", // Scale animation on toggle
        config: { tension: 250, friction: 25 }, // Smooth animation
      });

  useEffect(() => {
    if (transcribedData && editorRef.current) {
      const text = transcribedData.chunks
        .map((chunk) =>
          showTimestamps
            ? `${formatAudioTimestamp(chunk.timestamp[0])} ${chunk.text}`
            : chunk.text
        )
        .join("\n\n");
      editorRef.current.getEditor().setText(text); // Set text inside Quill editor
    }
  }, [transcribedData, showTimestamps]);

  const exportAsPDF = async () => {
    const delta = editorRef.current?.getEditor()?.getContents(); // Get Quill delta (content)
    if (!delta) return alert("No content to export.");

    try {
      const pdfAsBlob = await pdfExporter.generatePdf(delta); // Convert delta to PDF
      saveAs(pdfAsBlob, "pdf-export.pdf"); // Download the PDF file
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  // Export as JSON without HTML elements, combining text with timestamps in a single object
  const exportAsJSON = () => {
    const delta = editorRef.current?.getEditor()?.getContents(); // Get the Quill delta (content)
    if (!delta) return alert("No content to export.");

    // Combine insert operations and remove any HTML tags
    const jsonData = delta.ops.reduce((acc, op) => {
      if (op.insert && typeof op.insert === "string") {
        // If it's text, we just concatenate it with the previous part
        if (acc.length > 0 && typeof acc[acc.length - 1] === "string") {
          acc[acc.length - 1] += op.insert; // Concatenate text to the last entry
        } else {
          acc.push(op.insert); // Start a new entry if there's no previous one
        }
      }
      return acc;
    }, [] as string[]); // Initializing as an empty array

    // Add timestamps to each entry
    const finalData = transcribedData?.chunks.map((chunk, index) => ({
      timestamp: formatAudioTimestamp(chunk.timestamp[0]),
      text: jsonData[index] || "",
    })) || [];

    // Save the final data as JSON
    const blob = new Blob([JSON.stringify(finalData, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, "editor-content.json"); // Download the JSON file
  };

  const exportAsTXT = () => {
    const text = editorRef.current?.getEditor()?.getText(); // Get plain text content
    if (!text) return alert("No content to export.");
    
    const blob = new Blob([text], { type: "text/plain" });
    saveAs(blob, "editor-content.txt"); // Download the TXT file
  };

  const toggleTimestamps = () => {
    setShowTimestamps(!showTimestamps);
  };

  return (
    <div className="transcript-container flex flex-row">


      {/* Quill Editor */}
      <ReactQuill
        ref={editorRef}
        theme="snow"
        style={{  width: "100%" }}
        modules={{
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }],
            [{ align: [] }],
            [{ font: [] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ size: ["small", false, "large", "huge"] }],
            ["blockquote", "code-block"],
            ["video", "link", "formula"],
            [{ list: "ordered" }, { list: "bullet" }],
          ],
        }}
      />


    {transcribedData && !transcribedData.isBusy && (
    <div className="action-container flex flex-col h-full">
    {/* <animated.button
          onClick={toggleTimestamps}
          style={buttonAnimation} // Apply animation styles
          className=" px-6 py-3 text-white rounded-md shadow hover:cursor-pointer focus:outline-none"
        >
          {!showTimestamps ? "Show Timestamps" : "Hide Timestamps"}
        </animated.button> */}
  <button
    onClick={exportAsPDF}
    className="px-4 py-2 bg-red-500 text-white rounded-tr-lg shadow hover:bg-red-600 transition duration-300 focus:outline-none"
  >
    Export as PDF
  </button>
  <button
    onClick={exportAsJSON}
    className="px-4 py-2 bg-green-500 text-white  shadow hover:bg-green-600 transition duration-300 focus:outline-none"
  >
    Export as JSON
  </button>
  <button
    onClick={exportAsTXT}
    className="px-4 py-2 bg-yellow-500 text-white rounded-br-lg shadow hover:bg-yellow-600 transition duration-300 focus:outline-none"
  >
    Export as TXT
  </button>



      </div>
    )}



    </div>
  );
}
