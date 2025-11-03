import Seo from "@/components/Seo";
import { EFFECTIVE_DATE } from "./constants";

type MetaProps = {
  title: string;
  description: string;
  canonical: string;
};

export default function Meta({ title, description, canonical }: MetaProps) {
  return (
    <>
      <Seo title={title} description={description} url={canonical} />
      <p className="text-xs text-zinc-400 mt-1">Last updated {EFFECTIVE_DATE}</p>
    </>
  );
}
