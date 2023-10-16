import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Button,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';
import ContentHtml from './ContentHtml';
import Video from 'react-native-video';
import VideoPlayer from 'react-native-video-player';

import playlist from './../api.json';
export const WIDTH = Dimensions.get('screen').width;
export const HEIGHT = Dimensions.get('screen').height;

const VideoListSave = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [progress, setProgress] = useState(0);
  const [cashPlaylistData, setCashPlaylistData] = useState(null);
  const [render, setRender] = useState(false);

  const videoPath = `${RNFS.DocumentDirectoryPath}/playlist_id=${selectedCard?.id}.mp4`;

  const handleDownloadCardData = async () => {
    const errorText = 'Error downloading video';
    try {
      setProgress(0);
      const response = await RNFS.downloadFile({
        fromUrl: selectedCard.url,
        toFile: videoPath,
        begin: response => {
          console.log('begin', response);
        },
        progressInterval: 800,
        progress: response => {
          const progress =
            (response.bytesWritten * 100) / response.contentLength;
          setProgress(progress);
        },
      }).promise;

      if (response.statusCode === 200) {
        console.log('Video downloaded successfully');
      } else {
        Alert.alert(errorText);
        console.log('Error downloading video', error);
      }
      setRender(prev => !prev);
      setProgress(100);
    } catch (error) {
      Alert.alert(errorText);
      console.error(errorText, error);
    } finally {
      setTimeout(() => {
        setProgress(0);
      }, 500);
    }
  };

  const handleDeleteCardData = async () => {
    try {
      await RNFS.unlink(videoPath);
      setRender(prev => !prev);
    } catch (error) {
      console.log('Error delete video', error);
    }
  };

  const getData = async () => {
    try {
      const documentDirectoryPath = await RNFS.readDir(
        RNFS.DocumentDirectoryPath,
      );

      const filteredDocumentDirectoryPath = documentDirectoryPath.filter(item =>
        item?.path.includes('playlist_id='),
      );

      const filteredPlaylist = filteredDocumentDirectoryPath.map(item => {
        const match = item?.name?.match(/playlist_id=(\d+)/);
        return match ? match[1] : null;
      });

      const combinedPlaylist = playlist.map(item => ({
        ...item,
        general: filteredPlaylist.includes(item?.id) ? true : false,
      }));

      console.log('combinedPlaylist', combinedPlaylist);

      setCashPlaylistData(combinedPlaylist);
    } catch (error) {
      console.log('Error while receiving data', error);
    }
  };

  const checkVideo = () => {
    RNFS.stat(videoPath)
      .then(exists => {
        if (exists) {
          console.log('exists', exists);
        } else {
          console.log('Видео не найдено. Пожалуйста, сначала скачайте его.');
        }
      })
      .catch(error => {
        console.log('Ошибка при проверке существования видео:', error);
      });
  };

  useEffect(() => {
    getData();
    // checkVideo();
  }, [render]);

  const renderItem = useCallback(
    ({item}) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => setSelectedCard(item)}>
        <Text>{item.title}</Text>
        <View
          style={[
            styles.dot,
            {backgroundColor: item.general ? 'green' : '#c4c4c4'},
          ]}
        />
      </TouchableOpacity>
    ),
    [render],
  );

  const keyExtractor = useCallback(item => item?.id, []);

  const memoizedContentHtml = useMemo(
    () => (
      <ContentHtml
        html={`<iframe width="${WIDTH - 32}" height="${250}" src="${
          selectedCard?.url
        }" title="${selectedCard?.title}" ></iframe>`}
      />
    ),
    [selectedCard?.url],
  );

  return (
    <SafeAreaView>
      <FlatList
        data={cashPlaylistData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
      {selectedCard ? (
        <Modal transparent={true} visible={selectedCard ? true : false}>
          <View style={styles.modalBackground}>
            <View style={styles.modalCard}>
              <Text>{selectedCard.title}</Text>
              <Text>
                {progress ? `${progress.toString().substring(0, 4)}%` : ''}
              </Text>
              <View style={styles.modalVideo}>
                {selectedCard?.general ? (
                  <VideoPlayer
                    video={{
                      uri: videoPath,
                    }}
                    videoWidth={WIDTH - 32}
                    videoHeight={250}
                    autoplay={true}
                    style={styles.video}
                    defaultMuted={false}
                    loop={false}
                  />
                ) : (
                  memoizedContentHtml
                )}
              </View>

              <View style={styles.modalBottomRow}>
                <Button
                  title="Delete File"
                  onPress={handleDeleteCardData}
                  color="red"
                />
                <Button
                  title="Download"
                  onPress={handleDownloadCardData}
                  color="green"
                />
                <Button title="Back" onPress={() => setSelectedCard(null)} />
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#e5e5e5',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    width: WIDTH - 32,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalVideo: {
    margin: 10,
    backgroundColor: '#000',
    width: WIDTH - 32,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: WIDTH - 32,
    height: 250,
  },
  modalBottomRow: {
    flexDirection: 'row',
    width: WIDTH - 64,
    justifyContent: 'space-between',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default VideoListSave;
