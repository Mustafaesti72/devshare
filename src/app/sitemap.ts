import type { MetadataRoute } from "next";
import { indexable, siteUrl } from "@/lib/site";
import records from "@/lib/directory.json";
import articles from "@/lib/articles.json";
export default function sitemap():MetadataRoute.Sitemap {if(!indexable)return [];return ["/","/blog","/for-developers","/earnings",...records.map(r=>"/directory/"+r.fullName),...articles.map(a=>"/blog/"+a.slug)].map(path=>({url:new URL(path,siteUrl).href}))}
