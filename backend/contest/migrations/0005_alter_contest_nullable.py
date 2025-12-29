from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('contest', '0004_merge_20251228_1441'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contest',
            name='name',
            field=models.CharField(blank=True, max_length=100, null=True, verbose_name='대회명'),
        ),
        migrations.AlterField(
            model_name='contest',
            name='start_time',
            field=models.DateTimeField(blank=True, null=True, verbose_name='대회 시작시간'),
        ),
        migrations.AlterField(
            model_name='contest',
            name='end_time',
            field=models.DateTimeField(blank=True, null=True, verbose_name='대회 종료시간'),
        ),
    ]
