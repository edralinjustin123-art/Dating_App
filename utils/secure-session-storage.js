// SecureStore values stay small, even when a provider returns a large session.
export function createSecureSessionStorage(store, chunkSize = 1800) {
  let queue = Promise.resolve();
  let generation = 0;
  const serialize = (operation) => {
    const result = queue.then(operation, operation);
    queue = result.catch(() => {});
    return result;
  };
  const readMetadata = async (key) => {
    const raw = await store.getItemAsync(key);
    if (!raw) return null;
    const metadata = JSON.parse(raw);
    if (
      typeof metadata.id !== 'string' ||
      !Number.isInteger(metadata.count) ||
      metadata.count < 1 ||
      metadata.count > 1000
    )
      throw new Error('Invalid stored session.');
    return metadata;
  };
  const chunkKey = (key, metadata, index) => key + '.' + metadata.id + '.' + index;
  const removeChunks = async (key, metadata) => {
    if (!metadata) return;
    for (let index = 0; index < metadata.count; index += 1) {
      await store.deleteItemAsync(chunkKey(key, metadata, index));
    }
  };
  return {
    getItem: (key) =>
      serialize(async () => {
        const metadata = await readMetadata(key);
        if (!metadata) return null;
        const chunks = [];
        for (let index = 0; index < metadata.count; index += 1) {
          const chunk = await store.getItemAsync(chunkKey(key, metadata, index));
          if (chunk === null) throw new Error('Stored session is incomplete.');
          chunks.push(chunk);
        }
        return JSON.parse(chunks.join(''));
      }),
    setItem: (key, value) =>
      serialize(async () => {
        const previous = await readMetadata(key);
        // ASCII encoding prevents splitting UTF-8 characters across secure values.
        const encoded = JSON.stringify(value).replace(
          /[\u007f-\uffff]/g,
          (character) => '\\u' + character.charCodeAt(0).toString(16).padStart(4, '0'),
        );
        const metadata = {
          id: Date.now().toString(36) + '-' + generation++,
          count: Math.ceil(encoded.length / chunkSize),
        };
        try {
          for (let index = 0; index < metadata.count; index += 1) {
            await store.setItemAsync(
              chunkKey(key, metadata, index),
              encoded.slice(index * chunkSize, (index + 1) * chunkSize),
            );
          }
          // Publish only after every chunk has been saved successfully.
          await store.setItemAsync(key, JSON.stringify(metadata));
        } catch (error) {
          await removeChunks(key, metadata).catch(() => {});
          throw error;
        }
        await removeChunks(key, previous).catch(() => {});
      }),
    removeItem: (key) =>
      serialize(async () => {
        const metadata = await readMetadata(key);
        await store.deleteItemAsync(key);
        await removeChunks(key, metadata);
      }),
  };
}
