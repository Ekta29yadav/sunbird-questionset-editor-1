import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '../../services/data/data.service';
import { PublicDataService } from '../../services/public-data/public-data.service';
import { ServerResponse } from '../../interfaces/serverResponse';
import * as _ from 'lodash-es';
import { UUID } from 'angular2-uuid';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  public http: HttpClient;
  constructor(public dataService: DataService, http: HttpClient, private publicDataService: PublicDataService) {
    this.http = http;
  }

  readQuestion(questionId, formfields? ) {
    const option = {
      url: `question/v1/read/${questionId}`,
      param: {
        // tslint:disable-next-line:max-line-length
        fields: 'body,primaryCategory,mimeType,qType,answer,templateId,responseDeclaration,interactionTypes,interactions,name,solutions,editorState,media,' + formfields
      }
    };
    return this.publicDataService.get(option);
  }

  updateHierarchyQuestionCreate(questionSetId, metadata, questionSetHierarchy): Observable<ServerResponse> {
    const uniqueId = UUID.UUID();
    let hierarchyChildren: Array<string>;
    hierarchyChildren = questionSetHierarchy.childNodes || [];
    hierarchyChildren.push(uniqueId);
    const requestObj = {
      data: {
          nodesModified: {
            [uniqueId]: {
                  metadata,
                  objectType: 'Question',
                  root: false,
                  isNew: true
              }
          },
          hierarchy: {
          }
      }
    };
    requestObj.data.hierarchy[questionSetId] = {
      children: hierarchyChildren,
      root: true
    };
    const req = {
      url: 'questionset/v1/hierarchy/update',
      data: {
        request: requestObj
      }
    };
    return this.publicDataService.patch(req);
  }

  updateHierarchyQuestionUpdate(questionSetId, questionId, metadata, questionSetHierarchy): Observable<ServerResponse> {
    const requestObj = {
      data: {
          nodesModified: {
          },
          hierarchy: {
          }
      }
    };
    requestObj.data.hierarchy[questionSetId] = {
      children: questionSetHierarchy.childNodes,
      root: true
    };
    requestObj.data.nodesModified[questionId] = {
      metadata,
      objectType: 'Question',
      root: false,
      isNew: false
    };
    const req = {
      url: 'questionset/v1/hierarchy/update',
      data: {
        request: requestObj
      }
    };
    return this.publicDataService.patch(req);
  }

  getAssetMedia(req?: object) {
    const reqParam = {
      url: 'composite/v3/search',
      data: {
        request: {
          filters: {
            contentType: 'Asset',
            compatibilityLevel: {
              min: 1,
              max: 2
            },
            status: ['Live'],
          },
          limit: 50,
        }
      }
    };
    reqParam.data.request = req ? _.merge({}, reqParam.data.request, req) : reqParam;
    return this.publicDataService.post(reqParam);
  }

  createMediaAsset(req?: object) {
    const reqParam = {
      url: 'content/v3/create',
      data: {
        request: {
          content: {
            contentType: 'Asset',
            language: ['English'],
            code: UUID.UUID(),
          }
        }
      }
    };
    reqParam.data.request = req ? _.merge({}, reqParam.data.request, req) : reqParam;
    return this.publicDataService.post(reqParam);
  }

  uploadMedia(req, assetId: any) {
    let reqParam = {
      url: `content/v3/upload/${assetId}`,
      data: req.data
    };
    reqParam = req ? _.merge({}, reqParam, req) : reqParam;
    return this.publicDataService.post(reqParam);
  }

  generatePreSignedUrl(req, contentId: any) {
    const reqParam = {
      url: `content/v3/upload/url/${contentId}`,
      data: {
        request: req
      }
    };
    return this.publicDataService.post(reqParam);
  }

  getVideo(videoId) {
    const reqParam = {
      url: `content/v3/read/${videoId}`
    };
    return this.publicDataService.get(reqParam);
  }

}
