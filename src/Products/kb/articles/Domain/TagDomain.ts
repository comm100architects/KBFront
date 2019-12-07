import { ITagRepository } from "../Repository/TagRepository";
import { Tag } from "../Entity/Tag";

export class TagDomain {
  tagRepository: ITagRepository;

  constructor(tagRepository: ITagRepository) {
    this.tagRepository = tagRepository;
  }

  addTag(tag: Tag): Promise<Tag> {
    return this.tagRepository.add(tag);
  }

  updateTag(tag: Tag): Promise<Tag> {
    return this.tagRepository.update(tag.id, tag);
  }

  getTags(): Promise<Tag[]> {
    return this.tagRepository.list();
  }

  deleteTag(id: string): Promise<{}> {
    return this.tagRepository.delete(id);
  }
}
