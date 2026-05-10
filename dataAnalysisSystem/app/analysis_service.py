from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional
from datetime import datetime
import pandas as pd
from . import models, schemas
from .routers.conversion import safe_eval_expression


class AnalysisService:
    def __init__(self, db: Session):
        self.db = db

    def _apply_filters(self, query, filters: Optional[schemas.DataFilter]):
        if not filters:
            return query
        if filters.dimension_unique_ids:
            dimension_ids = self.db.query(models.Dimension.id).filter(
                models.Dimension.unique_id.in_(filters.dimension_unique_ids)
            ).all()
            dimension_ids = [d[0] for d in dimension_ids]
            query = query.filter(models.DataRecord.dimension_id.in_(dimension_ids))
        if filters.dimension_values:
            query = query.filter(models.DataRecord.dimension_value.in_(filters.dimension_values))
        if filters.start_date:
            query = query.filter(models.DataRecord.data_date >= filters.start_date)
        if filters.end_date:
            query = query.filter(models.DataRecord.data_date <= filters.end_date)
        if filters.units:
            query = query.filter(models.DataRecord.unit.in_(filters.units))
        if filters.category_names:
            category_ids = self.db.query(models.DataCategory.id).filter(
                models.DataCategory.name.in_(filters.category_names)
            ).all()
            category_ids = [c[0] for c in category_ids]
            if category_ids:
                query = query.filter(models.DataRecord.category_id.in_(category_ids))
        if filters.data_names:
            query = query.filter(models.DataRecord.data_name.in_(filters.data_names))
        return query

    def _convert_unit(self, value: float, source_unit: str, target_unit: str) -> float:
        if source_unit == target_unit:
            return value
        rule = self.db.query(models.ConversionRule).filter(
            models.ConversionRule.source_unit == source_unit,
            models.ConversionRule.target_unit == target_unit,
            models.ConversionRule.is_enabled == True
        ).first()
        if not rule:
            raise ValueError(f"未找到 {source_unit} 到 {target_unit} 的换算规则")
        return safe_eval_expression(rule.expression, value)

    def _convert_records_to_target_unit(self, records, target_unit: str):
        converted = []
        for record in records:
            try:
                converted_value = self._convert_unit(record.value, record.unit, target_unit)
                converted.append({
                    "id": record.id,
                    "unique_id": record.unique_id,
                    "data_name": record.data_name,
                    "dimension_unique_id": record.dimension.unique_id,
                    "dimension_display_name": record.dimension.display_name,
                    "dimension_value": record.dimension_value,
                    "value": converted_value,
                    "unit": target_unit,
                    "original_unit": record.unit,
                    "original_value": record.value,
                    "data_date": record.data_date,
                    "category_name": record.category.name if record.category else None
                })
            except ValueError as e:
                raise ValueError(f"数据 {record.unique_id}: {str(e)}")
        return converted

    def _get_group_key(self, record, group_by: str, group_rule: Optional[str] = None):
        if group_by == "dimension":
            return record["dimension_display_name"]
        elif group_by == "dimension_value":
            return record["dimension_value"]
        elif group_by == "data_name":
            return record["data_name"]
        elif group_by == "category":
            return record["category_name"] or "未分类"
        elif group_by == "date":
            date = record["data_date"]
            if group_rule == "year":
                return str(date.year)
            elif group_rule == "month":
                return f"{date.year}-{date.month:02d}"
            elif group_rule == "day":
                return date.strftime("%Y-%m-%d")
            elif group_rule == "quarter":
                quarter = (date.month - 1) // 3 + 1
                return f"{date.year}Q{quarter}"
            return date.strftime("%Y-%m-%d")
        elif group_by == "value_range":
            value = record["value"]
            if group_rule:
                ranges = [float(x.strip()) for x in group_rule.split(",")]
                ranges.sort()
                for i, r in enumerate(ranges):
                    if value < r:
                        return f"<{r}"
                return f">={ranges[-1]}"
            if value < 1000:
                return "<1000"
            elif value < 10000:
                return "1000-10000"
            return ">=10000"
        return str(record.get(group_by, "未知"))

    def _aggregate(self, groups: Dict[str, List[Dict]], aggregation_func: str):
        results = []
        for key, items in groups.items():
            values = [item["value"] for item in items]
            if aggregation_func == "sum":
                agg_value = sum(values)
            elif aggregation_func == "avg":
                agg_value = sum(values) / len(values) if values else 0
            elif aggregation_func == "count":
                agg_value = len(values)
            elif aggregation_func == "max":
                agg_value = max(values) if values else 0
            elif aggregation_func == "min":
                agg_value = min(values) if values else 0
            else:
                agg_value = sum(values)
            results.append({
                "group": key,
                "value": agg_value,
                "count": len(items)
            })
        return sorted(results, key=lambda x: x["group"])

    def analyze(self, request: schemas.AnalysisRequest):
        query = self.db.query(models.DataRecord)
        query = self._apply_filters(query, request.filters)
        records = query.all()
        if not records:
            return {"message": "没有匹配的数据", "chart_data": None}
        if request.target_unit:
            converted = self._convert_records_to_target_unit(records, request.target_unit)
        else:
            converted = [{
                "id": r.id,
                "unique_id": r.unique_id,
                "data_name": r.data_name,
                "dimension_unique_id": r.dimension.unique_id,
                "dimension_display_name": r.dimension.display_name,
                "dimension_value": r.dimension_value,
                "value": r.value,
                "unit": r.unit,
                "original_unit": r.unit,
                "original_value": r.value,
                "data_date": r.data_date,
                "category_name": r.category.name if r.category else None
            } for r in records]
        if request.aggregations:
            data = converted
            for agg_config in request.aggregations:
                groups: Dict[str, List] = {}
                for item in data:
                    key = self._get_group_key(item, agg_config.group_by, agg_config.group_rule)
                    if key not in groups:
                        groups[key] = []
                    groups[key].append(item)
                data = self._aggregate(groups, agg_config.aggregation_func)
        else:
            data = converted
        chart_data = self._generate_chart_data(data, request.chart_type, request.target_unit)
        return {
            "records_count": len(converted),
            "target_unit": request.target_unit,
            "chart_type": request.chart_type,
            "chart_data": chart_data,
            "raw_data": data[:100]
        }

    def _generate_chart_data(self, data: List[Any], chart_type: str, target_unit: Optional[str]):
        if chart_type == "table":
            if not data:
                return {"chart_type": "table", "headers": [], "rows": []}
            sample = data[0]
            if isinstance(sample, dict) and "group" in sample:
                headers = ["分组", "聚合值", "数量"]
                rows = [[item["group"], item["value"], item["count"]] for item in data]
            else:
                headers = ["数据名称", "维度", "维度值", "数值", "单位", "日期", "分类"]
                rows = []
                for item in data:
                    rows.append([
                        item.get("data_name", ""),
                        item.get("dimension_display_name", ""),
                        item.get("dimension_value", ""),
                        item.get("value", 0),
                        item.get("unit", ""),
                        item.get("data_date", "").strftime("%Y-%m-%d") if item.get("data_date") else "",
                        item.get("category_name", "")
                    ])
            return schemas.ChartData(
                chart_type="table",
                headers=headers,
                rows=rows
            )
        if chart_type == "pie":
            if not data or not isinstance(data[0], dict) or "group" not in data[0]:
                categories = []
                values = []
                for item in data:
                    categories.append(f"{item.get('data_name', '')}({item.get('dimension_value', '')})")
                    values.append(item.get("value", 0))
            else:
                categories = [item["group"] for item in data]
                values = [item["value"] for item in data]
            return schemas.ChartData(
                chart_type="pie",
                categories=categories,
                values=values
            )
        if chart_type == "line" or chart_type == "bar":
            if not data:
                return {"chart_type": chart_type, "x_axis": [], "series": []}
            if isinstance(data[0], dict) and "group" in data[0]:
                x_axis = [item["group"] for item in data]
                series = [{
                    "name": f"数值{('(' + target_unit + ')') if target_unit else ''}",
                    "data": [item["value"] for item in data]
                }]
            else:
                dates = sorted(list(set([item["data_date"].strftime("%Y-%m-%d") for item in data])))
                dimension_names = list(set([item["dimension_value"] for item in data]))
                series = []
                for dim_name in dimension_names:
                    dim_data = []
                    for date in dates:
                        value = sum(
                            item["value"] for item in data
                            if item["dimension_value"] == dim_name and
                               item["data_date"].strftime("%Y-%m-%d") == date
                        )
                        dim_data.append(value)
                    series.append({
                        "name": dim_name,
                        "data": dim_data
                    })
                x_axis = dates
            return schemas.ChartData(
                chart_type=chart_type,
                x_axis=x_axis,
                series=series
            )
        return schemas.ChartData(chart_type=chart_type)
