"use client";
import { useState } from "react";
import Link from "next/link";
import { useVault } from "@/context/VaultContext";
import FileList from "@/components/FileList";
import DeleteModal from "@/components/DeleteModal";
import PageTitle from "@/components/ui/PageTitle";
import Skeleton from "@/components/ui/Skeleton";
import { buttonClass } from "@/components/ui/Button";

export default function MyFiles() {
  const { owned, loaded } = useVault();
  const [del, setDel] = useState(null);
  return (
    <div>
      <PageTitle title="My Files">
        <Link href="/upload" className={buttonClass("primary")}>Upload</Link>
      </PageTitle>
      {!loaded ? <Skeleton className="h-48" /> : (
        <FileList
          files={owned}
          mode="mine"
          onDelete={setDel}
          emptyTitle="You haven't uploaded any files yet"
          emptyAction={<Link href="/upload" className={buttonClass("primary")}>Upload your first file</Link>}
        />
      )}
      {del && <DeleteModal file={del} onClose={() => setDel(null)} />}
    </div>
  );
}