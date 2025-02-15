import { Box } from '@invoke-ai/ui-library';
import NodeEditor from 'features/nodes/components/NodeEditor';
import { memo } from 'react';
import { ReactFlowProvider } from 'reactflow';

const NodesTab = () => {
  return (
    <Box layerStyle="first" position="relative" w="full" h="full" p={2} borderRadius="base">
      <ReactFlowProvider>
        <NodeEditor />
      </ReactFlowProvider>
    </Box>
  );
};

export default memo(NodesTab);
