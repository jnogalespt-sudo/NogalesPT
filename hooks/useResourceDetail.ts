import { useEffect } from 'react';
import { AppView, Resource } from '../types';
import { dbService } from '../services/dbService';

export function useResourceDetail(
  resources: Resource[],
  view: AppView,
  setSelectedResource: (resource: Resource | null) => void
) {
  useEffect(() => {
    if (typeof window !== 'undefined' && resources.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') as AppView;
      const idParam = params.get('id');

      if (viewParam === AppView.Detail && idParam) {
        const found = resources.find(r => r.id === idParam);
        if (found) {
          if (found.fileType === 'html' && found.pastedCode === undefined) {
            dbService.getResourceById(found.id).then((fullResource: Resource | null) => {
              if (fullResource) {
                setSelectedResource({
                  ...fullResource,
                  pastedCode: fullResource.pastedCode || ""
                });
              }
            }).catch((e: any) => console.warn("Error fetching full resource:", e));
          } else {
            setSelectedResource(found);
          }
        }
      }
    }
  }, [resources, view, setSelectedResource]);
}
