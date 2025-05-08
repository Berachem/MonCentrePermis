import React from "react";
import parse, { DOMNode, Element } from "html-react-parser";

interface CourseContentProps {
  content: string;
  className?: string;
}

const ClassesContent: React.FC<CourseContentProps> = ({
  content,
  className,
}) => {
  const options = {
    replace: (domNode: DOMNode) => {
      if (domNode instanceof Element && domNode.name === "img") {
        const { src, alt } = domNode.attribs;
        return (
          <>
            <br />
            <img
              src={src}
              alt={alt || ""}
              className="my-9 max-w-[25vh] h-auto mx-auto"
            />
            <br />
          </>
        );
      }
    },
  };

  return <div className={className}>{parse(content, options)}</div>;
};

export default ClassesContent;
