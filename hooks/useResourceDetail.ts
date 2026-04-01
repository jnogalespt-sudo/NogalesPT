import { useEffect, useState } from 'react';
import { AppView, Resource } from '../types';
import { dbService } from '../services/dbService';

export function useResourceDetail(
  resources: Resource[],
  view: AppView,
  selectedResource: Resource | null,
  setSelectedResource: (resource: Resource | null) => void,
  isLoading: boolean
) {
  const [isDetailLoading, setIsDetailLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') === AppView.Detail && !!params.get('id');
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading) {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') as AppView;
      const idParam = params.get('id');

      if (viewParam === AppView.Detail && idParam) {
        const found = resources.find(r => r.id === idParam);
        if (found) {
          if (selectedResource?.id === found.id) {
            if (found.fileType !== 'html' || selectedResource.pastedCode !== undefined) {
              setIsDetailLoading(false);
              return;
            }
          }

          if (found.fileType === 'html' && found.pastedCode === undefined) {
            setIsDetailLoading(true);
            dbService.getResourceById(found.id).then((fullResource: Resource | null) => {
              if (fullResource) {
                setSelectedResource({
                  ...fullResource,
                  pastedCode: fullResource.pastedCode || ""
                });
              }
            }).catch((e: any) => console.warn("Error fetching full resource:", e))
              .finally(() => setIsDetailLoading(false));
          } else {
            setSelectedResource(found);
            setIsDetailLoading(false);
          }
        } else {
          setIsDetailLoading(true);
          dbService.getResourceById(idParam).then((fullResource: Resource | null) => {
            if (fullResource) {
              setSelectedResource({
                ...fullResource,
                pastedCode: fullResource.pastedCode || ""
              });
            }
          }).catch((e: any) => console.warn("Error fetching full resource:", e))
            .finally(() => setIsDetailLoading(false));
        }
      } else {
        setIsDetailLoading(false);
      }
    }
  }, [resources, view, isLoading]);

  return { isDetailLoading };
}
