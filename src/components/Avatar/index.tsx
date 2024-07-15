import React from "react";

type AvatarProps = {
  svg: string;
};
const Avatar: React.FC<AvatarProps> = ({ svg }) => {
  return (
    <div
      className="rounded-full"
      dangerouslySetInnerHTML={{
        __html: svg || "",
      }}
    ></div>
  );
};

export default Avatar;
