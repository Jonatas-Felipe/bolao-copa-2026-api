import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddWeightToMatches1718880000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('matches', 'weight')
    if (!hasColumn) {
      await queryRunner.query(`ALTER TABLE "matches" ADD "weight" integer NOT NULL DEFAULT 10`)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn('matches', 'weight')
    if (hasColumn) {
      await queryRunner.query(`ALTER TABLE "matches" DROP COLUMN "weight"`)
    }
  }
}
