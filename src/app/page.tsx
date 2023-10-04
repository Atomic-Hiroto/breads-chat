import { db } from "@/lib/db"


export default async function Home() {
  await db.set('Hello','hellow')
  
  return (
    <></>
  )
}
