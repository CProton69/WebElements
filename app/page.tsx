import { PageBuilder } from "@/components/page-builder/PageBuilder1";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-blue-800 font-medium">🔧 Debug Tools:</span>
            <Link
              href="/test-preview-system"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              Test Preview System
            </Link>
            <Link
              href="/create-test-data"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              Create Test Data
            </Link>
            <Link
              href="/preview-simple"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              Simple Preview
            </Link>
            <Link
              href="/preview-direct"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              Direct Preview
            </Link>
          </div>
        </div>
      </div>
      <PageBuilder />
    </div>
  );
}
