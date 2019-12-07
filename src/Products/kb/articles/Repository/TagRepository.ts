import {
  IRepository,
  RESTfulRepository,
} from "../../../../framework/repository";
import { Tag } from "../Entity/Tag";

export interface ITagRepository extends IRepository<Tag> {}
