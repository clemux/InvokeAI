import { IconButton, Input, InputGroup, InputRightElement } from '@invoke-ai/ui-library';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import {imagesFilterTextChanged} from 'features/gallery/store/gallerySlice';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PiXBold } from 'react-icons/pi';

const ImagesFilter = () => {
  const dispatch = useAppDispatch();
  const imagesFilterText = useAppSelector((s) => s.gallery.imagesFilterText);
  const { t } = useTranslation();

  const handleImagesFilter = useCallback(
    (searchTerm: string) => {
      dispatch(imagesFilterTextChanged(searchTerm));
    },
    [dispatch]
  );

  const clearImagesFilter = useCallback(() => {
    dispatch(imagesFilterTextChanged(''));
  }, [dispatch]);

  const handleKeydown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      // exit search mode on escape
      if (e.key === 'Escape') {
        clearImagesFilter();
      }
    },
    [clearImagesFilter]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleImagesFilter(e.target.value);
    },
    [handleImagesFilter]
  );

  return (
    <InputGroup>
      <Input
        placeholder='%keyword%'
        value={imagesFilterText}
        onKeyDown={handleKeydown}
        onChange={handleChange}
        data-testid="images-filter-input"
      />
      {imagesFilterText && imagesFilterText.length && (
        <InputRightElement h="full" pe={2}>
          <IconButton
            onClick={clearImagesFilter}
            size="sm"
            variant="link"
            aria-label={t('gallery.imagesFilter')}
            icon={<PiXBold />}
          />
        </InputRightElement>
      )}
    </InputGroup>
  );
};

export default memo(ImagesFilter);
