/*
  Warnings:

  - Made the column `username` on table `Comment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `Comment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userId` on table `Comment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "username" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "picture" TEXT;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
