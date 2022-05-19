import React from 'react'

export default function Loading() {
  return <li className="text-center w-100 my-5"><div class="spinner-border text-primary" role="status">
    <span class="sr-only m-auto">Loading...</span>
  </div></li>
  // return <li className="text-center w-100 my-5"><div class="spinner-grow text-primary" role="status">
  //   <span class="sr-only">Loading...</span>
  // </div></li>
}
