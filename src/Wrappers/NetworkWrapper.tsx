import React, { ReactNode } from 'react'

interface Props{
    children: ReactNode;
}

function NetworkWrapper({children}: Props) {
  return (
    <>
     {children}
    </>
  )
}

export default NetworkWrapper