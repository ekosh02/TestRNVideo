import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  Button,
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {
  DocumentDirectoryPath,
  writeFile,
  readDir,
  stat,
  readFile,
  downloadFile,
  unlink,
} from 'react-native-fs';

const LoadingView = () => (
  <View style={styles.loading}>
    <Text style={styles.body}>Loading...</Text>
  </View>
);

const FileView = ({file, onClose}) => {
  const [ready, setReady] = useState(false);
  const [contents, setContents] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const fileStat = await stat(file.path);

        if (fileStat.isFile()) {
          const fileData = await readFile(fileStat.path, 'utf8');
          setContents(fileData);
          setReady(true);
        }
      } catch (e) {
        console.log('e', e);
      }
    })();

    return () => null;
  }, [file]);

  const deleteFile = async () => {
    try {
      await unlink(file.path);
      onClose();
    } catch (e) {
      console.log('e', e);
    }
  };

  if (!ready) return <LoadingView />;

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.body}>&lt; Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.main}>
        <Text style={styles.title}>{file.name}</Text>
        <Text style={styles.body}>{contents}</Text>
      </View>
      <Button title="Delete File" onPress={deleteFile} color="red" />
    </>
  );
};

const CreateView = ({setCreateViewActive}) => {
  const [fileText, setFileText] = useState('');

  const saveFile = async () => {
    const path = `${DocumentDirectoryPath}/${Date.now()}.txt`;

    try {
      await writeFile(path, fileText, 'utf8');
      setCreateViewActive(false);
    } catch (e) {
      console.log('error', e);
    }
  };

  return (
    <>
      <View style={styles.main}>
        <Text style={styles.title}>Enter text for your file:</Text>
        <TextInput
          value={fileText}
          onChangeText={setFileText}
          style={styles.textArea}
          multiline
          textAlignVertical="top"
        />
      </View>
      <Button title="Save File" onPress={saveFile} />
    </>
  );
};

const ListView = ({setCreateViewActive, selectFile}) => {
  const [ready, setReady] = useState(false);
  const [files, setFiles] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const filesArr = await readDir(DocumentDirectoryPath);

        setFiles(filesArr);
        setReady(true);
      } catch (e) {
        console.log('error', e);
      }
    })();

    return () => null;
  }, []);

  if (!ready) return <LoadingView />;

  const renderItem = ({item}) => (
    <TouchableOpacity style={styles.file} onPress={() => selectFile(item)}>
      <Text style={styles.body}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={styles.main}>
        {files.length > 0 ? (
          <FlatList
            data={files}
            renderItem={renderItem}
            keyExtractor={item => item.name}
          />
        ) : (
          <Text>No files</Text>
        )}
      </View>
      <Button
        title="Create new file"
        onPress={() => setCreateViewActive(true)}
      />
    </>
  );
};

const TextSave = () => {
  const [createViewActive, setCreateViewActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const getCurrentView = () => {
    if (createViewActive) {
      return <CreateView setCreateViewActive={setCreateViewActive} />;
    }

    if (selectedFile) {
      return (
        <FileView file={selectedFile} onClose={() => setSelectedFile(null)} />
      );
    }

    return (
      <ListView
        setCreateViewActive={setCreateViewActive}
        selectFile={setSelectedFile}
      />
    );
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.container}>{getCurrentView()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    padding: 16,
    flex: 1,
  },
  main: {
    flex: 1,
    display: 'flex',
    paddingVertical: 16,
  },
  textArea: {
    height: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
    fontSize: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  loading: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    fontSize: 18,
  },
  file: {
    paddingVertical: 12,
  },
});

export default TextSave;
