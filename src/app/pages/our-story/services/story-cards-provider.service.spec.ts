import { TestBed } from '@angular/core/testing';

import { StoryCardsProviderService } from './story-cards-provider.service';

describe('StoryCardsProviderService', () => {
  let service: StoryCardsProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoryCardsProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
