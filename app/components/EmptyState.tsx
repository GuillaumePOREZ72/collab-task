import React, { FC } from "react";
import Image from "next/image";

interface EmptyStateProps {
  imageSrc: string;
  imageAlt: string;
  message: string;
}

/**
 * EmptyState
 *
 * EmptyState is a component used to display an image and a message when there is no content to display.
 * It is typically used in a page or a container where there is no content, such as an empty list or an empty page.
 *
 * @param {string} imageSrc The URL of the image to display.
 * @param {string} imageAlt The alt text for the image.
 * @param {string} message The message to display below the image.
 *
 * @returns A JSX element containing the image and the message.
 */
const EmptyState: FC<EmptyStateProps> = ({ imageSrc, imageAlt, message }) => {
  return (
    <div className="my-40 w-full h-full justify-center items-center flex flex-col">
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={500}
        height={500}
        className="w-40 h-40"
      />
      <p className="text-sm text-gray-500 mt-2">{message}</p>
    </div>
  );
};

export default EmptyState;
