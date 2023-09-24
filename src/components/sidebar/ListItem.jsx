import React from "react";
import Link from 'next/link'

const ListItem = ({text, navLink, Icon}) => {
  return (
    <Link href={navLink} className="w-full">
      <div className="flex mt-5 hover:bg-secondarybase hover:text-primarybase  rounded-lg p-2">
        {Icon && <Icon className="h-5 w-5"/>}
        <p className="px-5">{text}</p>
      </div>
    </Link>
  );
};

export default ListItem;
