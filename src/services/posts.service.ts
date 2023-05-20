import { postsRepository } from '../global/connection';
import { NetworkError } from '../network.error';
import { UploadedFile } from 'express-fileupload';
import { Sequelize } from 'sequelize-typescript';
function uploadFiles(files: UploadedFile | UploadedFile[]): string[] {
  const medias = [];
  for (const file of files instanceof Array ? files : [files]) {
    const [fileName, extention] = file.name.split('.', 2);
    const path = `medias/${fileName}-${Date.now()}.${extention}`;
    medias.push(path);
    file.mv(path);
  }
  return medias;
}
export async function getPosts(id: number) {
  return await postsRepository().findAll({
    offset: Number(id) * 20,
    limit: 20,
    order: [['id', 'desc']],
  });
}

export async function getMyPosts(id: number, userId: number) {
  return await postsRepository().findAll({
    where: {
      id: userId,
    },
    offset: id * 20,
    limit: 20,
    order: [['id', 'desc']],
  });
}

export async function removePost(id: number, userId: number) {
  const deletedCount = await postsRepository().destroy({
    where: {
      id: Number(id),
      creatorId: userId,
    },
  });
  if (!deletedCount) {
    throw new NetworkError(400, {
      message: 'Эта запись не приндлежит вам',
    });
  }
  return {
    success: true,
  };
}

export async function addPost(
  files: UploadedFile | UploadedFile[],
  text: string,
  id: number,
) {
  return await postsRepository().create({
    text: text,
    medias: uploadFiles(files),
    creatorId: id,
  });
}

export async function editPost(
  id: number,
  creatorId: number,
  addFiles: UploadedFile | UploadedFile[],
  removeFiles: string[],
  text?: string,
) {
  const post = await postsRepository().findOne({
    where: {
      id: id,
      creatorId: creatorId,
    },
  });
  if (!post) {
    throw new NetworkError(400, {
      message: 'Эта запись не приндлежит вам',
    });
  }
  return await post.update({
    medias: post.medias
      .filter((u) => !removeFiles.includes(u))
      .concat(uploadFiles(addFiles)),
    text: text,
  });
}
