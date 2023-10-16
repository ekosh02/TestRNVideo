import React, {memo, useMemo} from 'react';
import {useWindowDimensions} from 'react-native';
import RenderHTML from 'react-native-render-html';
import {WebView} from 'react-native-webview';
import IframeRenderer, {iframeModel} from '@native-html/iframe-plugin';

const ContentHtml = ({html}) => {
  const {width} = useWindowDimensions();

  const memoRenderers = useMemo(
    () => ({
      iframe: IframeRenderer,
    }),
    [],
  );

  const memoCustomHTMLElementModels = useMemo(
    () => ({
      iframe: iframeModel,
    }),
    [],
  );

  const memoDefaultWebViewProps = useMemo(
    () => ({
      startInLoadingState: true,
      mediaPlaybackRequiresUserAction: false,
      allowsFullscreenVideo: true,
      androidHardwareAccelerationDisabled: true,
      style: {opacity: 0.99, overflow: 'hidden'},
    }),
    [],
  );

  const memoRenderersProps = useMemo(
    () => ({
      iframe: {
        scalesPageToFit: true,
      },
    }),
    [],
  );

  const memoHtml = useMemo(
    () => ({
      html: html,
    }),
    [html],
  );

  if (!html) {
    return <></>;
  }

  const MemoizedRenderHtml = memo(RenderHTML);

  return (
    <MemoizedRenderHtml
      contentWidth={width}
      renderers={memoRenderers}
      WebView={WebView}
      source={memoHtml}
      customHTMLElementModels={memoCustomHTMLElementModels}
      renderersProps={memoRenderersProps}
      defaultWebViewProps={memoDefaultWebViewProps}
    />
  );
};

export default ContentHtml;
