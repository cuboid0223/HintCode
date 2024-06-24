import React from "react";

type ThumbnailProps = {
  svg: string;
};
const Thumbnail: React.FC<ThumbnailProps> = ({ svg }) => {
  return (
    <div
      className="rounded-full"
      dangerouslySetInnerHTML={{
        __html: svg || "",
      }}
    ></div>
  );
};

export default Thumbnail;
