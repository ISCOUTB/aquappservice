import { Injectable } from '@angular/core';
import {
  UrlTree,
  UrlSegmentGroup,
  DefaultUrlSerializer,
  UrlSegment
} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UrlService {
  constructor() {}

  gen(segments: string[], queryParams: any): string {
    const urlTree = new UrlTree();
    urlTree.root = new UrlSegmentGroup(
      segments.map(segment => new UrlSegment(segment, {})),
      {}
    );
    urlTree.queryParams = queryParams;
    const urlSerializer = new DefaultUrlSerializer();
    return urlSerializer.serialize(urlTree);
  }
}
