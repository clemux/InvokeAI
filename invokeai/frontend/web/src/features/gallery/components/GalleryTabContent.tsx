import { Box, Flex } from '@invoke-ai/ui-library';
import React, { memo } from 'react';
import {useStore} from "@nanostores/react";
import {$galleryHeader} from "app/store/nanostores/galleryHeader";

const GalleryTabContent = () => {
  const galleryHeader = useStore($galleryHeader);
  return (
    <Flex borderRadius="base" w="full" h="full" flexDir="column" gap={2}>
      <Flex gap={2} w="full">
        {/*<BoardsList />*/}
      </Flex>
      <Box layerStyle="first" p={2} borderRadius="base" w="full" h="full">
      {galleryHeader}
      </Box>
    </Flex>
  );
};

export default memo(GalleryTabContent);
